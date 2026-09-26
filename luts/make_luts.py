"""Generate the SEIU / Ô Long Mộc 3D LUTs (.cube) for the Blackmagic Camera app.

Each look is written twice:
  *_AppleLog.cube  input = iPhone Apple Log (Rec.2020 primaries), output = Rec.709
  *_Rec709.cube    input = normal Rec.709 video, output = Rec.709

Run:  python3 luts/make_luts.py      (needs numpy + Pillow)
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
N = 33

# ---------------------------------------------------------------- Apple Log -> Rec.709
R0, RT, C = -0.05641088, 0.01, 47.28711236
BETA, GAMMA, DELTA = 0.00964052, 0.08550479, 0.69336945
PT = C * (RT - R0) ** 2
M2020_TO_709 = np.array([
    [1.660491, -0.587641, -0.072850],
    [-0.124551, 1.132900, -0.008349],
    [-0.018151, -0.100579, 1.118730],
])


def apple_log_decode(p):
    p = np.asarray(p, dtype=np.float64)
    lin = np.where(p >= PT, 2.0 ** ((p - DELTA) / GAMMA) - BETA, np.sqrt(np.clip(p, 0, None) / C) + R0)
    return np.where(p <= 0, R0, lin)


def aces_fit(x):
    return np.clip((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0, 1)


# exposure so 18% grey lands at ~0.42 on a Rec.709 display
_lo, _hi = 0.01, 5.0
for _ in range(60):
    _mid = (_lo + _hi) / 2
    if aces_fit(0.18 * _mid) ** (1 / 2.4) < 0.42:
        _lo = _mid
    else:
        _hi = _mid
EXPOSURE = _mid


def apple_log_to_709(rgb):
    lin = apple_log_decode(rgb) @ M2020_TO_709.T
    lin = np.clip(lin, 0, None) * EXPOSURE
    return aces_fit(lin) ** (1 / 2.4)


# ---------------------------------------------------------------- colour helpers
def luma(rgb):
    return rgb @ np.array([0.2126, 0.7152, 0.0722])


def curve(x, pts):
    xs, ys = zip(*pts)
    return np.interp(x, xs, ys)


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-9
    rc = np.where(m & (mx == r), ((g - b) / np.where(m, d, 1)) % 6, 0)
    gc = np.where(m & (mx == g) & (mx != r), (b - r) / np.where(m, d, 1) + 2, 0)
    bc = np.where(m & (mx == b) & (mx != r) & (mx != g), (r - g) / np.where(m, d, 1) + 4, 0)
    h = (rc + gc + bc) * 60.0
    s = np.where(mx > 1e-9, d / np.where(mx > 1e-9, mx, 1), 0)
    return np.stack([h % 360, s, mx], -1)


def hsv_to_rgb(hsv):
    h, s, v = hsv[..., 0] % 360, np.clip(hsv[..., 1], 0, 1), hsv[..., 2]
    c = v * s
    x = c * (1 - np.abs((h / 60) % 2 - 1))
    m = v - c
    z = np.zeros_like(h)
    k = (h // 60).astype(int) % 6
    r = np.choose(k, [c, x, z, z, x, c])
    g = np.choose(k, [x, c, c, x, z, z])
    b = np.choose(k, [z, z, x, c, c, x])
    return np.stack([r + m, g + m, b + m], -1)


def band(h, center, width):
    """Smooth 0..1 weight for hues within `width` degrees of `center`."""
    d = np.abs((h - center + 180) % 360 - 180)
    return np.clip(1 - d / width, 0, 1) ** 2


def skin_mask(hsv):
    return band(hsv[..., 0], 25, 25) * np.clip((hsv[..., 1] - 0.08) / 0.12, 0, 1) * np.clip(1.3 - hsv[..., 1] * 1.5, 0, 1)


def grade(rgb, *, wb=(1, 1, 1), tone, shadow_tint=(0, 0, 0), high_tint=(0, 0, 0),
          sat=1.0, skin_sat=1.0, skin_lift=0.0, hue_moves=(), sat_moves=()):
    rgb = np.clip(rgb * np.array(wb), 0, 1)
    rgb = curve(rgb, tone)
    L = luma(rgb)[..., None]
    rgb = rgb + np.array(shadow_tint) * (1 - L) ** 2 + np.array(high_tint) * L ** 2
    hsv = rgb_to_hsv(np.clip(rgb, 0, 1))
    h, s = hsv[..., 0], hsv[..., 1]
    for center, width, shift in hue_moves:
        h = h + shift * band(h, center, width)
    sk = skin_mask(hsv)
    factor = sat * (1 - sk) + skin_sat * sk
    for center, width, mult in sat_moves:
        factor = factor * (1 + (mult - 1) * band(hsv[..., 0], center, width))
    hsv = np.stack([h, s * factor, hsv[..., 2] + skin_lift * sk], -1)
    return np.clip(hsv_to_rgb(hsv), 0, 1)


# ---------------------------------------------------------------- the looks
LOOKS = {
    "HanQuoc_Film": dict(
        desc="Phim Hàn ban ngày: mềm, đen nhấc nhẹ, bóng tối xanh ngọc, da sáng ấm",
        wb=(0.99, 1.0, 1.01),
        tone=[(0, 0.055), (0.1, 0.13), (0.25, 0.275), (0.5, 0.525), (0.75, 0.765), (0.9, 0.875), (1, 0.945)],
        shadow_tint=(-0.025, 0.008, 0.03), high_tint=(0.018, 0.008, -0.012),
        sat=0.86, skin_sat=0.93, skin_lift=0.02,
        hue_moves=[(110, 60, 22), (215, 35, -12)],
        sat_moves=[(110, 60, 0.8)],
    ),
    "HanQuoc_Dem": dict(
        desc="Phim Hàn ban đêm: xanh đêm lạnh, đen xanh navy, da giữ tự nhiên",
        wb=(0.94, 0.99, 1.06),
        tone=[(0, 0.045), (0.1, 0.11), (0.3, 0.29), (0.5, 0.48), (0.8, 0.77), (1, 0.93)],
        shadow_tint=(-0.02, 0.012, 0.055), high_tint=(-0.005, 0.01, 0.02),
        sat=0.8, skin_sat=1.1, skin_lift=0.02,
        hue_moves=[(110, 60, 30), (220, 40, -15)],
        sat_moves=[(110, 60, 0.7), (0, 25, 0.9)],
    ),
    "OLongMoc_TraSua": dict(
        desc="Ô Long Mộc: ấm, nâu kem trà sữa, vàng mật, không gian quán ấm cúng",
        wb=(1.045, 1.0, 0.925),
        tone=[(0, 0.05), (0.12, 0.14), (0.3, 0.31), (0.5, 0.52), (0.75, 0.77), (0.9, 0.9), (1, 0.955)],
        shadow_tint=(0.022, 0.008, -0.02), high_tint=(0.015, 0.01, -0.015),
        sat=0.95, skin_sat=1.0, skin_lift=0.015,
        hue_moves=[(45, 25, -6), (110, 60, -10)],
        sat_moves=[(30, 25, 1.14), (110, 60, 0.75), (220, 40, 0.8)],
    ),
    "SEIU_TuoiSang": dict(
        desc="SEIU: sáng, sạch, trong trẻo kiểu Hàn, đỏ thương hiệu SEIU rực và chuẩn",
        wb=(0.995, 1.0, 1.01),
        tone=[(0, 0.025), (0.1, 0.13), (0.3, 0.35), (0.5, 0.57), (0.75, 0.8), (0.9, 0.92), (1, 0.975)],
        shadow_tint=(-0.01, 0.0, 0.015), high_tint=(0.0, 0.003, 0.01),
        sat=0.97, skin_sat=0.97, skin_lift=0.025,
        hue_moves=[(110, 60, 12)],
        sat_moves=[(357, 14, 1.12), (110, 60, 0.85)],
    ),
}


# ---------------------------------------------------------------- write .cube
def lattice():
    v = np.linspace(0, 1, N)
    b, g, r = np.meshgrid(v, v, v, indexing="ij")  # red changes fastest
    return np.stack([r, g, b], -1).reshape(-1, 3)


def write_cube(path, title, table):
    with open(path, "w", newline="\n") as f:
        f.write(f'TITLE "{title}"\n')
        f.write(f"LUT_3D_SIZE {N}\n")
        f.write("DOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0\n")
        for r, g, b in np.clip(table, 0, 1):
            f.write(f"{r:.6f} {g:.6f} {b:.6f}\n")


def read_cube(path):
    rows = [l.split() for l in open(path) if l[:1].isdigit() or l[:1] == "-" or l[:1] == "."]
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
        params = {k: v for k, v in look.items() if k != "desc"}
        write_cube(os.path.join(OUT, f"{name}_Rec709.cube"), f"{name} Rec709", grade(grid, **params))
        write_cube(os.path.join(OUT, f"{name}_AppleLog.cube"), f"{name} AppleLog", grade(as709, **params))
    preview()


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
