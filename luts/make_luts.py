"""Generate the SEIU / Ô Long Mộc 3D LUTs (.cube) for the Blackmagic Camera app.

Every look is written for two inputs and two strengths:
  <Look>_AppleLog.cube      iPhone Apple Log (Rec.2020) -> Rec.709, full look
  <Look>_Rec709.cube        normal Rec.709 video -> Rec.709, full look
  <Look>_Nhe_*.cube         same, softer (55% strength)
plus AppleLog_to_Rec709.cube, a neutral conversion for manual grading.

The look engine works in OKLab (perceptual): smooth PCHIP tone curves,
cosine-windowed hue bands, skin protection and gamut compression instead
of clipping, so gradients stay clean.

Run:  python3 luts/make_luts.py      (needs numpy + Pillow)
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
N = 33
SOFT = 0.55

# ---------------------------------------------------------------- maths helpers
def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def pchip(pts):
    """Monotone cubic (Fritsch-Carlson) through control points; returns f(x)."""
    xs, ys = map(np.asarray, zip(*pts))
    h = np.diff(xs)
    d = np.diff(ys) / h
    m = np.zeros_like(ys)
    m[0], m[-1] = d[0], d[-1]
    for i in range(1, len(xs) - 1):
        if d[i - 1] * d[i] > 0:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])

    def f(x):
        x = np.clip(x, xs[0], xs[-1])
        i = np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2)
        t = (x - xs[i]) / h[i]
        t2, t3 = t * t, t * t * t
        return ((2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i]
                + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1])
    return f


def band(h, center, width):
    d = np.abs((h - center + 180) % 360 - 180)
    return np.where(d < width, 0.5 * (1 + np.cos(np.pi * d / width)), 0.0)


# ---------------------------------------------------------------- OKLab (Rec.709 primaries)
M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
               [0.2119034982, 0.6806995451, 0.1073969566],
               [0.0883024619, 0.2817188376, 0.6299787005]])
M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
               [1.9779984951, -2.4285922050, 0.4505937099],
               [0.0259040371, 0.7827717662, -0.8086757660]])
M1i, M2i = np.linalg.inv(M1), np.linalg.inv(M2)


def lin_to_lab(rgb):
    return np.cbrt(rgb @ M1.T) @ M2.T


def lab_to_lin(lab):
    return ((lab @ M2i.T) ** 3) @ M1i.T


def to_lin(disp):
    return np.clip(disp, 0, 1) ** 2.4


def to_disp(lin):
    return np.clip(lin, 0, 1) ** (1 / 2.4)


def gamut_compress(L, a, b):
    """Pull chroma in (keeping L and hue) until the colour fits Rec.709."""
    L = np.clip(L, 0, 1)
    lab = np.stack([L, a, b], -1)
    lin = lab_to_lin(lab)
    bad = (lin.min(-1) < -1e-5) | (lin.max(-1) > 1 + 1e-5)
    if bad.any():
        lo, hi = np.zeros(bad.sum()), np.ones(bad.sum())
        Lb, ab, bb = L[bad], a[bad], b[bad]
        for _ in range(14):
            mid = (lo + hi) / 2
            t = lab_to_lin(np.stack([Lb, ab * mid, bb * mid], -1))
            ok = (t.min(-1) >= -1e-5) & (t.max(-1) <= 1 + 1e-5)
            lo, hi = np.where(ok, mid, lo), np.where(ok, hi, mid)
        lin[bad] = lab_to_lin(np.stack([Lb, ab * lo, bb * lo], -1))
    return np.clip(lin, 0, 1)


# ---------------------------------------------------------------- Apple Log -> Rec.709
R0, RT, C = -0.05641088, 0.01, 47.28711236
BETA, GAMMA, DELTA = 0.00964052, 0.08550479, 0.69336945
PT = C * (RT - R0) ** 2
M2020_TO_709 = np.array([[1.660491, -0.587641, -0.072850],
                         [-0.124551, 1.132900, -0.008349],
                         [-0.018151, -0.100579, 1.118730]])


def apple_log_decode(p):
    p = np.asarray(p, dtype=np.float64)
    lin = np.where(p >= PT, 2.0 ** ((p - DELTA) / GAMMA) - BETA, np.sqrt(np.clip(p, 0, None) / C) + R0)
    return np.where(p <= 0, R0, lin)


def apple_log_encode(lin):
    lin = np.asarray(lin, dtype=np.float64)
    return np.where(lin >= RT, GAMMA * np.log2(np.maximum(lin, RT) + BETA) + DELTA,
                    np.where(lin > R0, C * (lin - R0) ** 2, 0.0))


def shoulder(x):
    """Soft filmic shoulder (extended Reinhard, white = 8)."""
    return x * (1 + x / 64.0) / (1 + x)


def _render(lin709, k):
    """Per-channel filmic shoulder: smoothest through a 33-point LUT, and bright
    colours drift towards white the way film does."""
    lin = np.clip(shoulder(np.clip(lin709, 0, None) * k), 0, 1)
    # display encode with a short linear toe: a pure power curve is so steep near
    # zero that lattice interpolation lifts and tints the blacks
    return np.where(lin < 0.0031308, 12.92 * lin, 1.055 * lin ** (1 / 2.4) - 0.055)


_lo, _hi = 0.05, 20.0
for _ in range(60):  # exposure so 18% grey lands at 0.46
    _mid = (_lo + _hi) / 2
    if _render(np.full((1, 3), 0.18), _mid)[0, 0] < 0.46:
        _lo = _mid
    else:
        _hi = _mid
EXPOSURE = _mid


def apple_log_to_709(rgb):
    # clamp sub-black noise before the gamut matrix, otherwise its negative
    # values get amplified and tint the blacks
    return _render(np.clip(apple_log_decode(rgb), 0, None) @ M2020_TO_709.T, EXPOSURE)


# ---------------------------------------------------------------- look engine
def grade(disp, look, strength=1.0):
    lin = to_lin(disp) * np.array(look["wb"])
    lab = lin_to_lab(np.clip(lin, 0, None))
    L0, a0, b0 = lab[..., 0], lab[..., 1], lab[..., 2]
    C0 = np.hypot(a0, b0)
    h = np.degrees(np.arctan2(b0, a0)) % 360

    L = pchip(look["tone"])(L0)
    Cc = C0 * np.clip((L / np.maximum(L0, 1e-4)) ** 0.35, 0.6, 1.4)
    Cc *= 1 - look["hl_desat"] * smooth(0.78, 1.0, L)
    Cc *= 1 - look["sh_desat"] * smooth(0.3, 0.05, L)

    colour = smooth(0.006, 0.025, C0)
    skin = (band(h, 50, 24) * smooth(0.015, 0.035, C0) * (1 - smooth(0.11, 0.17, C0))
            * smooth(0.22, 0.38, L0))
    for hc, width, dh, cm, dl in look["bands"]:
        w = band(h, hc, width) * colour * (1 - 0.85 * skin)
        h = h + dh * w
        Cc = Cc * (1 + (cm - 1) * w)
        L = L + dl * w
    Cc *= look["chroma"] * (1 - skin) + look["skin_chroma"] * skin
    L = L + look["skin_L"] * skin
    h = h + look["skin_hue"] * skin

    hr = np.radians(h)
    ws, wh = (1 - smooth(0.0, 0.6, L)), smooth(0.45, 1.0, L)
    a = Cc * np.cos(hr) + look["shadow_ab"][0] * ws + look["high_ab"][0] * wh
    b = Cc * np.sin(hr) + look["shadow_ab"][1] * ws + look["high_ab"][1] * wh
    out = to_disp(gamut_compress(L, a, b))
    return disp + (out - disp) * strength


# hue reference (OKLCh degrees): SEIU red 27, skin 44-55, milk tea 69, yellow 96,
# foliage 131-144, sky 258, blue 274
LOOKS = {
    "HanQuoc_Film": dict(
        desc="Phim Hàn ban ngày: sáng mềm, đen nhấc, lá cây xanh ngọc, da trắng hồng",
        wb=(0.985, 1.0, 1.02),
        tone=[(0, 0.10), (0.2, 0.27), (0.4, 0.45), (0.536, 0.585), (0.7, 0.74), (0.85, 0.86), (1, 0.955)],
        shadow_ab=(-0.012, -0.012), high_ab=(0.004, 0.012),
        chroma=0.8, skin_chroma=0.95, skin_L=0.03, skin_hue=-3,
        bands=[(137, 55, 28, 0.62, 0.02), (96, 24, 6, 0.8, 0.0), (258, 45, -18, 0.85, 0.02), (27, 16, 0, 0.9, 0.0)],
        hl_desat=0.3, sh_desat=0.2,
    ),
    "HanQuoc_Dem": dict(
        desc="Phim Hàn ban đêm: xanh đêm điện ảnh, đen navy, da vẫn sáng ấm",
        wb=(0.92, 0.98, 1.1),
        tone=[(0, 0.09), (0.2, 0.23), (0.4, 0.39), (0.536, 0.51), (0.7, 0.68), (0.85, 0.82), (1, 0.93)],
        shadow_ab=(-0.018, -0.035), high_ab=(-0.004, -0.012),
        chroma=0.72, skin_chroma=1.4, skin_L=0.03, skin_hue=0,
        bands=[(137, 55, 28, 0.55, 0.0), (258, 50, -18, 1.1, 0.0), (27, 20, 0, 0.85, 0.0)],
        hl_desat=0.25, sh_desat=0.1,
    ),
    "OLongMoc_TraSua": dict(
        desc="Ô Long Mộc: ấm nâu kem, vàng mật, đen nâu mềm, quán ấm cúng",
        wb=(1.07, 1.0, 0.87),
        tone=[(0, 0.09), (0.2, 0.26), (0.4, 0.44), (0.536, 0.57), (0.7, 0.725), (0.85, 0.855), (1, 0.955)],
        shadow_ab=(0.012, 0.018), high_ab=(0.004, 0.018),
        chroma=0.92, skin_chroma=1.0, skin_L=0.02, skin_hue=0,
        bands=[(64, 26, 0, 1.2, 0.0), (137, 42, -10, 0.55, 0.0), (258, 45, 0, 0.6, 0.0), (27, 18, 5, 1.05, 0.0)],
        hl_desat=0.25, sh_desat=0.1,
    ),
    "SEIU_TuoiSang": dict(
        desc="SEIU: sáng trong kiểu Hàn, trắng sạch hơi lạnh, da hồng sáng, đỏ SEIU rực",
        wb=(0.985, 1.0, 1.02),
        tone=[(0, 0.05), (0.2, 0.26), (0.4, 0.47), (0.536, 0.61), (0.7, 0.77), (0.85, 0.885), (1, 0.975)],
        shadow_ab=(-0.006, -0.01), high_ab=(-0.002, -0.006),
        chroma=0.92, skin_chroma=1.12, skin_L=0.045, skin_hue=-3,
        bands=[(27, 15, 0, 1.2, 0.0), (137, 42, 18, 0.75, 0.02), (258, 36, -10, 1.0, 0.03)],
        hl_desat=0.35, sh_desat=0.1,
    ),
}


# ---------------------------------------------------------------- .cube io
def lattice():
    v = np.linspace(0, 1, N)
    b, g, r = np.meshgrid(v, v, v, indexing="ij")  # red changes fastest
    return np.stack([r, g, b], -1).reshape(-1, 3)


def write_cube(path, title, table):
    with open(path, "w", newline="\n") as f:
        f.write(f'TITLE "{title}"\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0\n')
        for r, g, b in np.clip(table, 0, 1):
            f.write(f"{r:.6f} {g:.6f} {b:.6f}\n")


def read_cube(path):
    rows = [l.split() for l in open(path) if l[:1].isdigit() or l[:1] in "-."]
    return np.array(rows, dtype=np.float64).reshape(N, N, N, 3)  # [b][g][r]


def apply_cube(cube, img):
    x = np.clip(img, 0, 1) * (N - 1)
    i0 = np.floor(x).astype(int).clip(0, N - 2)
    f = x - i0
    out = np.zeros_like(img)
    for db in (0, 1):
        for dg in (0, 1):
            for dr in (0, 1):
                w = ((f[..., 0] if dr else 1 - f[..., 0]) * (f[..., 1] if dg else 1 - f[..., 1])
                     * (f[..., 2] if db else 1 - f[..., 2]))
                out += w[..., None] * cube[i0[..., 2] + db, i0[..., 1] + dg, i0[..., 0] + dr]
    return out


def main():
    grid = lattice()
    as709 = apple_log_to_709(grid)
    write_cube(os.path.join(OUT, "AppleLog_to_Rec709.cube"), "Apple Log to Rec709 (SEIU)", as709)
    for name, look in LOOKS.items():
        for tag, strength in (("", 1.0), ("_Nhe", SOFT)):
            write_cube(os.path.join(OUT, f"{name}{tag}_Rec709.cube"), f"{name}{tag} Rec709", grade(grid, look, strength))
            write_cube(os.path.join(OUT, f"{name}{tag}_AppleLog.cube"), f"{name}{tag} AppleLog", grade(as709, look, strength))
    check()
    preview()


def check():
    """Hue bands must not fold hues over; the grey ramp must stay monotonic
    and smooth through every LUT; neutral Apple Log black must stay black."""
    for name, look in LOOKS.items():
        for hc, width, dh, cm, dl in look["bands"]:
            assert abs(dh) * np.pi / (2 * width) < 0.85, f"{name}: hue band at {hc} folds hues"
    black = apply_cube(read_cube(os.path.join(OUT, "AppleLog_to_Rec709.cube")), apple_log_encode(np.zeros((1, 1, 3))))
    assert black.max() < 0.02 and np.ptp(black) < 0.004, f"Apple Log black lifted or tinted: {black}"
    ramp = np.linspace(0, 1, 256)[:, None].repeat(3, 1)
    log_ramp = apple_log_encode(np.geomspace(0.0005, 12, 256))[:, None].repeat(3, 1)
    for fn in sorted(os.listdir(OUT)):
        if not fn.endswith(".cube"):
            continue
        out = apply_cube(read_cube(os.path.join(OUT, fn)), log_ramp if "AppleLog" in fn else ramp)
        y = out @ np.array([0.2126, 0.7152, 0.0722])
        d = np.diff(y)
        assert d.min() > -0.002, f"{fn}: grey ramp not monotonic"  # tolerance: half an 8-bit step
        assert np.abs(np.diff(d)).max() < 0.02, f"{fn}: grey ramp has a kink"


def preview():
    swatches = [
        ("Da tối", (115, 82, 68)), ("Da sáng", (194, 150, 130)), ("Da Hàn", (232, 190, 165)),
        ("Trà sữa", (196, 160, 120)), ("Đường nâu", (120, 70, 35)), ("Đỏ SEIU", (229, 37, 42)),
        ("Trời", (98, 122, 157)), ("Lá cây", (87, 108, 67)), ("Xanh lá", (70, 148, 73)),
        ("Cam", (214, 126, 44)), ("Vàng", (231, 199, 31)), ("Xanh dương", (56, 61, 150)),
        ("Tím", (94, 60, 108)), ("Cyan", (8, 133, 161)), ("Đêm", (20, 28, 45)),
    ]
    sw, sh, lab, ramp_h, pad = 84, 64, 190, 26, 14
    rows = [("Gốc (Rec.709)", None)] + [(n, n) for n in LOOKS]
    W = lab + len(swatches) * sw + pad * 2
    H = 40 + len(rows) * (sh + ramp_h + 10) + pad
    img = Image.new("RGB", (W, H), (24, 22, 28))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    for i, (n, _) in enumerate(swatches):
        d.text((pad + lab + i * sw + 4, 14), n, fill=(220, 215, 205), font=small)
    base = np.array([c for _, c in swatches], dtype=np.float64)[None] / 255
    ramp = np.linspace(0, 1, len(swatches) * sw)[None, :, None].repeat(3, -1)
    for ri, (title, name) in enumerate(rows):
        y = 36 + ri * (sh + ramp_h + 10)
        if name:
            cube = read_cube(os.path.join(OUT, f"{name}_Rec709.cube"))
            cols, rr = apply_cube(cube, base), apply_cube(cube, ramp)
        else:
            cols, rr = base, ramp
        d.text((pad, y + 22), title, fill=(240, 235, 225), font=font)
        for i, c in enumerate(cols[0]):
            d.rectangle([pad + lab + i * sw, y, pad + lab + (i + 1) * sw - 3, y + sh], fill=tuple((c * 255).round().astype(int)))
        strip = Image.fromarray((rr[0] * 255).round().astype(np.uint8)[None].repeat(ramp_h, 0))
        img.paste(strip, (pad + lab, y + sh + 4))
    img.save(os.path.join(OUT, "preview.png"))


if __name__ == "__main__":
    main()
