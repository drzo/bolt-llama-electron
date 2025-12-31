# Release Process

This document describes how to create and publish releases for Bolt Llama Electron.

## Automated Release Process

The project uses GitHub Actions to automatically build and release the application for Windows, macOS, and Linux when a new version tag is pushed.

### Creating a New Release

1. **Update Version Number**

   Edit `package.json` and update the version:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Commit Changes**

   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.0"
   git push origin master
   ```

3. **Create and Push Tag**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Wait for Build**

   GitHub Actions will automatically:
   - Build the app for macOS, Linux, and Windows
   - Create installers for each platform
   - Create a GitHub Release with all artifacts
   - Upload installers to the release

5. **Monitor Progress**

   Check the Actions tab on GitHub:
   https://github.com/drzo/bolt-llama-electron/actions

### Build Artifacts

The automated build produces the following artifacts:

#### macOS
- `Bolt-Llama-{version}.dmg` - DMG installer
- `Bolt-Llama-{version}-mac.zip` - ZIP archive

#### Linux
- `Bolt-Llama-{version}.AppImage` - Portable AppImage
- `Bolt-Llama-{version}.deb` - Debian package

#### Windows
- `Bolt-Llama-Setup-{version}.exe` - NSIS installer
- `Bolt-Llama-{version}.exe` - Portable executable

## Manual Release Process

If you need to build manually:

### Prerequisites

- Node.js 18+
- npm or yarn
- Platform-specific build tools:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libarchive-tools`
  - **Windows**: Visual Studio Build Tools

### Build Commands

```bash
# Install dependencies
npm install

# Build for current platform
npm run build

# Output will be in the release/ directory
```

### Platform-Specific Builds

```bash
# macOS only
npm run build:electron -- --mac

# Linux only
npm run build:electron -- --linux

# Windows only
npm run build:electron -- --win
```

## Release Checklist

Before creating a release:

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md with release notes
- [ ] Test the application on all platforms
- [ ] Verify all features work correctly
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Update documentation if needed
- [ ] Commit all changes
- [ ] Create and push version tag
- [ ] Verify GitHub Actions build succeeds
- [ ] Test downloaded installers on each platform
- [ ] Update release notes on GitHub if needed

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

Examples:
- `v1.0.0` - First stable release
- `v1.1.0` - Added new feature
- `v1.1.1` - Fixed bug in 1.1.0
- `v2.0.0` - Breaking changes from 1.x

## Pre-release Versions

For testing before official release:

```bash
# Create pre-release tag
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

Pre-release versions will be marked as "Pre-release" on GitHub.

## Code Signing (Optional)

For production releases, code signing is recommended:

### macOS

1. Get an Apple Developer certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   ```

### Windows

1. Get a code signing certificate
2. Set environment variables:
   ```bash
   set CSC_LINK=C:\path\to\certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```

### GitHub Actions

Add secrets to your repository:
- `CSC_LINK` - Base64 encoded certificate
- `CSC_KEY_PASSWORD` - Certificate password

Update `.github/workflows/release.yml`:
```yaml
- name: Build Electron app
  run: npm run build
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    CSC_LINK: ${{ secrets.CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
```

## Auto-Update (Future)

To enable auto-updates:

1. Configure electron-updater in `package.json`:
   ```json
   {
     "build": {
       "publish": {
         "provider": "github",
         "owner": "drzo",
         "repo": "bolt-llama-electron"
       }
     }
   }
   ```

2. Implement update checking in the app
3. Users will receive notifications for new versions

## Troubleshooting

### Build Fails on GitHub Actions

- Check the Actions logs for errors
- Verify all dependencies are in `package.json`
- Ensure build scripts are correct
- Check for platform-specific issues

### Installer Doesn't Work

- Test on a clean machine without dev tools
- Check file permissions
- Verify code signing (if used)
- Review electron-builder logs

### Missing Files in Build

- Check `package.json` `build.files` configuration
- Verify all assets are included
- Check `.gitignore` doesn't exclude needed files

## Support

For issues with releases:
1. Check existing [GitHub Issues](https://github.com/drzo/bolt-llama-electron/issues)
2. Create a new issue with:
   - Platform and version
   - Steps to reproduce
   - Error messages
   - Build logs (if applicable)

---

**Last Updated**: December 31, 2025
