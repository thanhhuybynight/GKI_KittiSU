# GKI KittiSU

**Build GKI kernels with [KittiSU](https://github.com/terebiko/KittiSU) + SUSFS via GitHub Actions**

[English](README-EN.md) | **Tiếng Việt**

[![KittiSU](https://img.shields.io/badge/KittiSU-Supported-ff69b4?style=flat-square)](https://github.com/terebiko/KittiSU)
[![SUSFS](https://img.shields.io/badge/SUSFS-Integrated-E67E22?style=flat-square)](https://gitlab.com/simonpunk/susfs4ksu)
[![Pages](https://img.shields.io/badge/Web-GitHub%20Pages-222?style=flat-square&logo=github)](https://thanhhuybynight.github.io/GKI_KittiSU/)

Trang web + workflow build kernel GKI tích hợp **KittiSU**, lấy cảm hứng từ [kernel.takeshi.dev](https://kernel.takeshi.dev/) và [GKI_KernelSU_SUSFS](https://github.com/thanhhuybynight/GKI_KernelSU_SUSFS).

---

## ✨ Tính năng

- Build kernel **GKI** (5.10 / 5.15 / 6.1 / 6.6 / 6.12) bằng GitHub Actions
- Mặc định dùng **KittiSU** (`terebiko/KittiSU`)
- **Branch / tag / commit KittiSU tùy chỉnh** khi trigger workflow
- Hỗ trợ thêm Official / SukiSU / ReSukiSU nếu cần
- Trang web tra cứu version GKI + hướng dẫn (EN / VI / 中文)
- Deploy GitHub Pages tự động

---

## 🚀 Bắt đầu nhanh

### 1. Fork / tạo repo trên GitHub

```bash
# Clone local rồi push lên repo mới của bạn
git remote add origin https://github.com/<USER>/GKI_KittiSU.git
git push -u origin main
```

### 2. Bật GitHub Actions & Pages

1. **Settings → Actions → General** → cho phép Actions
2. **Settings → Pages** → Source: **GitHub Actions**
3. Chạy workflow **Update Data & Deploy Pages** (tab Actions)

Site sẽ nằm tại: `https://<USER>.github.io/GKI_KittiSU/`

### 2b. Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New Project** → import `thanhhuybynight/GKI_KittiSU`
2. Giữ cấu hình mặc định trong repo (`vercel.json` đã có sẵn):
   - **Install:** `cd web && npm ci`
   - **Build:** `bash scripts/vercel-build.sh`
   - **Output:** `web`
3. **Deploy** → nhận URL dạng `https://gki-kittisu-xxx.vercel.app`
4. (Tuỳ chọn) gắn custom domain trong Vercel → Settings → Domains

Build script sẽ:
- `webpack` → `web/dist/`
- copy `data/` → `web/data/` (JSON version GKI)

Local thử build:

```bash
bash scripts/vercel-build.sh
# hoặc: npm run build
```


### 2c. Web Build qua Vercel (trigger Actions chủ repo)

Luồng: **Web form → `/api/build` (Vercel) → `kernel-custom.yml` trên repo chủ**.  
PAT **chỉ** nằm trong Vercel Environment Variables — user không cần token.

1. Deploy project lên Vercel (mục 2b)
2. **Vercel → Project → Settings → Environment Variables** thêm:

| Name | Value |
|------|--------|
| `GH_PAT` | Fine-grained PAT: **Actions: Read and write** trên repo `thanhhuybynight/GKI_KittiSU` |
| `GITHUB_REPO` | `thanhhuybynight/GKI_KittiSU` (tuỳ chọn, mặc định vậy) |
| `GITHUB_REF` | `main` (tuỳ chọn) |
| `BUILD_KEY` | (tuỳ chọn) chuỗi bí mật chống spam; nếu set, thêm cùng giá trị vào `web/js/config.js` → `buildKey` |

3. Redeploy sau khi set env
4. Mở site → tab **Web Build** → **Bắt đầu build**

API:
- `POST /api/build` — trigger workflow
- `GET /api/runs` — lịch sử (dùng PAT server-side nếu có)

---
### 3. Build kernel

**Cách A — Custom (một version cụ thể)**  
Actions → **Android 内核构建-自定义** (`kernel-custom.yml`)

| Input | Mô tả | Ví dụ |
|--------|--------|--------|
| `kernel_version` | Phiên bản kernel | `6.1` |
| `os_patch_level` | Security patch hoặc `lts` | `2025-01` / `lts` |
| `kernelsu_variant` | Biến thể | **`KittiSU`** (mặc định) |
| `kittisu_repo` | Repo KittiSU | `terebiko/KittiSU` |
| `kittisu_branch` | **Branch / tag / commit tùy chỉnh** | `main`, `dev`, `abc1234` |

**Cách B — Build nhiều version**  
Actions → **构建内核** (`main.yml`) — chọn Android version + option KittiSU.

**Cách C — Theo series**  
`kernel-a12-5-10.yml` … `kernel-a16-6-12.yml`

### 4. Tải artifact

Sau khi build xong → tab **Artifacts** của run (AnyKernel3.zip / full package).

---

## 🐱 Branch KittiSU tùy chỉnh

### Qua workflow input (khuyến nghị)

Khi **Run workflow**:

```
kernelsu_variant = KittiSU
kittisu_repo     = terebiko/KittiSU
kittisu_branch   = <branch-hoặc-commit-của-bạn>
```

Ví dụ build với fork/branch riêng:

```
kittisu_repo   = yourname/KittiSU
kittisu_branch = feature/my-hook
```

### Qua `config/config`

```ini
custom=true
kittisu_repo=terebiko/KittiSU
kittisu=feature/my-branch   # hoặc full commit hash
```

Khi `custom=true`, giá trị `kittisu=` **ghi đè** input workflow (tiện pin commit ổn định).

---

## 📁 Cấu trúc repo

```
GKI_KittiSU/
├── .github/workflows/     # Build kernel + deploy Pages
│   ├── main.yml           # Build nhiều version
│   ├── kernel-custom.yml  # Build 1 version (khuyến nghị)
│   ├── build.yml          # Core build (gọi từ các workflow khác)
│   ├── get-manager.yml    # Tải Manager APK KittiSU
│   └── update-pages.yml   # Cập nhật data + deploy web
├── config/config          # Pin commit/branch KittiSU & SUSFS
├── data/                  # JSON version GKI (auto update)
├── web/                   # Frontend dashboard
└── scripts/               # Script fetch GKI versions
```

---

## 🔗 Liên kết

| | |
|--|--|
| **KittiSU** | https://github.com/terebiko/KittiSU |
| **GKI build reference** | https://github.com/thanhhuybynight/GKI_KernelSU_SUSFS |
| **Reference site** | https://kernel.takeshi.dev/ |
| **Telegram KittiSU** | https://t.me/terebiko_KittiSU |

---

## ⚠️ Lưu ý

- Build GKI tốn **~30–60 phút** và dung lượng runner lớn — đừng spam workflow.
- Backup boot partition trước khi flash.
- Một số ROM (ColorOS 14/15, …) có thể không tương thích — xem wiki upstream.
- Manager APK được lấy từ CI của repo KittiSU bạn chỉ định; nếu branch chưa có artifact manager, job `get-manager` có thể fail (kernel vẫn build được nếu gọi riêng).

---

## 📜 License

Dựa trên [GKI_KernelSU_SUSFS](https://github.com/zzh20188/GKI_KernelSU_SUSFS) (GPL-2.0).  
KittiSU: xem [terebiko/KittiSU](https://github.com/terebiko/KittiSU).

## Credit

- [terebiko/KittiSU](https://github.com/terebiko/KittiSU) / [anotheranhiutangerine](https://github.com/anotheranhiutangerine)
- [zzh20188/GKI_KernelSU_SUSFS](https://github.com/zzh20188/GKI_KernelSU_SUSFS)
- [ReSukiSU](https://github.com/ReSukiSU/ReSukiSU) · [SukiSU-Ultra](https://github.com/SukiSU-Ultra/SukiSU-Ultra) · [KernelSU](https://github.com/tiann/KernelSU)
- [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu)
