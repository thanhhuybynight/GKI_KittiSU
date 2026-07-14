# GKI KittiSU

**Build GKI kernels with [KittiSU](https://github.com/terebiko/KittiSU) + SUSFS via GitHub Actions**

**English** | [Tiếng Việt](README.md)

[![KittiSU](https://img.shields.io/badge/KittiSU-Supported-ff69b4?style=flat-square)](https://github.com/terebiko/KittiSU)
[![SUSFS](https://img.shields.io/badge/SUSFS-Integrated-E67E22?style=flat-square)](https://gitlab.com/simonpunk/susfs4ksu)

Website + GitHub Actions pipelines specialized for **KittiSU** GKI builds, inspired by [kernel.takeshi.dev](https://kernel.takeshi.dev/) and [GKI_KernelSU_SUSFS](https://github.com/thanhhuybynight/GKI_KernelSU_SUSFS).

---

## Features

- Build **GKI** kernels (5.10 / 5.15 / 6.1 / 6.6 / 6.12) with GitHub Actions
- Default root solution: **KittiSU** (`terebiko/KittiSU`)
- **Custom KittiSU branch / tag / commit** on every workflow dispatch
- Optional Official / SukiSU / ReSukiSU variants
- GKI version dashboard + guide (EN / VI / 中文)
- Automatic GitHub Pages deploy

---

## Quick start

1. Push this repo to GitHub (`main` branch)
2. Enable **Actions** and **Pages → GitHub Actions**
3. Run **Update Data & Deploy Pages**
4. Run **kernel-custom** or **main** with:
   - `kernelsu_variant=KittiSU`
   - `kittisu_repo=terebiko/KittiSU` (or your fork)
   - `kittisu_branch=<your-branch>`

### Pin via `config/config`

```ini
custom=true
kittisu_repo=terebiko/KittiSU
kittisu=feature/my-branch
```

---

## Links

- KittiSU: https://github.com/terebiko/KittiSU
- Upstream build system: https://github.com/zzh20188/GKI_KernelSU_SUSFS
- Reference site: https://kernel.takeshi.dev/

## License

Based on GKI_KernelSU_SUSFS (GPL-2.0). See KittiSU repo for KittiSU licensing.
