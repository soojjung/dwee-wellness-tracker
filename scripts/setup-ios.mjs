#!/usr/bin/env node
/**
 * Patch the generated (git-ignored) Capacitor iOS project so it can be
 * rebuilt from scratch: `npx cap add ios && pnpm ios:setup`.
 *
 * Idempotent — every step checks before writing, so it is safe to re-run
 * after `cap sync` or after Xcode touched the project.
 *
 * What it does (release-plan-v1 §3):
 *  - Info.plist: usage descriptions (en fallback), `dwee://` URL scheme,
 *    en/ko localizations, portrait-only on iPhone, export-compliance flag
 *  - en.lproj / ko.lproj InfoPlist.strings registered in the Xcode target
 *  - deployment target 15.0 (pbxproj + Podfile), MARKETING_VERSION / CURRENT_PROJECT_VERSION
 *    from package.json `version` / `iosBuild`
 *  - 1024 app icon from public/, plain #F5F3F4 launch screen
 *  - DEVELOPMENT_TEAM + App.entitlements (Sign in with Apple) registered in the target
 *
 * Nothing is left to do in Xcode for a debug build; App Store signing still
 * needs the distribution certificate the first time.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iosApp = join(root, 'ios', 'App');
const appDir = join(iosApp, 'App');
const plistPath = join(appDir, 'Info.plist');
const pbxprojPath = join(iosApp, 'App.xcodeproj', 'project.pbxproj');
const podfilePath = join(iosApp, 'Podfile');
const storyboardPath = join(appDir, 'Base.lproj', 'LaunchScreen.storyboard');
const iconSrc = join(root, 'public', 'app-icon-1024.png');
const iconDst = join(appDir, 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png');

const DEPLOYMENT_TARGET = '15.0';
// Apple Developer team (not a secret) — lets a fresh `cap add ios` sign without opening Xcode.
const DEVELOPMENT_TEAM = '6KCGZ5594F';
const URL_SCHEME = 'dwee';
const LAUNCH_BG = { red: 0.9608, green: 0.9529, blue: 0.9569 }; // #F5F3F4

// en is the source of truth (Info.plist fallback); ko is the translation.
const USAGE = {
  en: {
    NSCameraUsageDescription: 'dwee uses the camera to take photos for your diary and home screen.',
    NSPhotoLibraryUsageDescription:
      'dwee opens your photo library so you can pick photos for your diary and home screen.',
  },
  ko: {
    NSCameraUsageDescription: '다이어리와 홈 화면에 넣을 사진을 찍기 위해 카메라를 사용해요.',
    NSPhotoLibraryUsageDescription:
      '다이어리와 홈 화면에 넣을 사진을 고르기 위해 사진 보관함을 열어요.',
  },
};

const log = (msg) => console.log(`[setup-ios] ${msg}`);

if (!existsSync(plistPath)) {
  console.error('[setup-ios] ios/App not found. Run `npx cap add ios` first.');
  process.exit(1);
}

// ---------------------------------------------------------------- Info.plist
{
  let plist = readFileSync(plistPath, 'utf8');
  const has = (key) => plist.includes(`<key>${key}</key>`);
  const append = (xml) => {
    plist = plist.replace(/<\/dict>\s*<\/plist>\s*$/, `${xml}</dict>\n</plist>\n`);
  };
  const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  for (const [key, text] of Object.entries(USAGE.en)) {
    if (has(key)) continue;
    append(`\t<key>${key}</key>\n\t<string>${xmlEscape(text)}</string>\n`);
    log(`Info.plist: added ${key}`);
  }

  if (!has('CFBundleURLTypes')) {
    append(
      `\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n` +
        `\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>\n` +
        `\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${URL_SCHEME}</string>\n\t\t\t</array>\n` +
        `\t\t</dict>\n\t</array>\n`,
    );
    log(`Info.plist: registered ${URL_SCHEME}:// URL scheme`);
  }

  if (!has('CFBundleLocalizations')) {
    append(
      `\t<key>CFBundleLocalizations</key>\n\t<array>\n\t\t<string>en</string>\n\t\t<string>ko</string>\n\t</array>\n`,
    );
    log('Info.plist: added CFBundleLocalizations (en, ko)');
  }

  if (!has('ITSAppUsesNonExemptEncryption')) {
    append('\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n');
    log('Info.plist: added ITSAppUsesNonExemptEncryption=false');
  }

  // iPhone layout is portrait-only; iPad keeps every orientation (release plan: iPad 세로·가로).
  const iphoneOrientations =
    /<key>UISupportedInterfaceOrientations<\/key>\s*<array>[\s\S]*?<\/array>/;
  const portraitOnly =
    '<key>UISupportedInterfaceOrientations</key>\n\t<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>';
  if (
    iphoneOrientations.test(plist) &&
    !plist.match(iphoneOrientations)[0].includes(portraitOnly)
  ) {
    const current = plist.match(iphoneOrientations)[0];
    if (current.includes('Landscape')) {
      plist = plist.replace(iphoneOrientations, portraitOnly);
      log('Info.plist: iPhone orientations → portrait only');
    }
  }

  writeFileSync(plistPath, plist);
}

// -------------------------------------------------------- InfoPlist.strings
{
  const created = [];
  for (const [lang, entries] of Object.entries(USAGE)) {
    const dir = join(appDir, `${lang}.lproj`);
    const file = join(dir, 'InfoPlist.strings');
    const body =
      Object.entries(entries)
        .map(([k, v]) => `"${k}" = "${v.replace(/"/g, '\\"')}";`)
        .join('\n') + '\n';
    if (existsSync(file) && readFileSync(file, 'utf8') === body) continue;
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, body);
    created.push(lang);
  }
  if (created.length) log(`InfoPlist.strings written: ${created.join(', ')}`);

  // Register the variant group in the Xcode target via the xcodeproj gem
  // (bundled with CocoaPods). Without this the .strings files are not copied
  // into the bundle and iOS falls back to the English Info.plist text.
  const ruby = `
require 'xcodeproj'
project = Xcodeproj::Project.open(ARGV[0])
target = project.targets.find { |t| t.name == 'App' }
app_group = project.main_group['App']
langs = %w[en ko]
project.root_object.known_regions |= langs
group = app_group.children.find { |c| c.is_a?(Xcodeproj::Project::Object::PBXVariantGroup) && c.name == 'InfoPlist.strings' }
group ||= app_group.new_variant_group('InfoPlist.strings')
changed = false
langs.each do |lang|
  path = "#{lang}.lproj/InfoPlist.strings"
  next if group.files.any? { |f| f.path == path }
  ref = group.new_reference(path)
  ref.name = lang
  changed = true
end
unless target.resources_build_phase.files_references.include?(group)
  target.add_resources([group])
  changed = true
end
project.save if changed
puts(changed ? 'registered' : 'already registered')
`;
  try {
    const out = execFileSync('ruby', ['-e', ruby, join(iosApp, 'App.xcodeproj')], {
      encoding: 'utf8',
    }).trim();
    log(`InfoPlist.strings in Xcode target: ${out}`);
  } catch (err) {
    console.warn(
      '[setup-ios] could not register InfoPlist.strings via the xcodeproj gem ' +
        '(is CocoaPods installed?). Add App/en.lproj and App/ko.lproj InfoPlist.strings ' +
        'to the App target in Xcode manually.\n' +
        String(err.stderr ?? err.message),
    );
  }
}

// ------------------------------------------------ deployment target, version
{
  let pbx = readFileSync(pbxprojPath, 'utf8');
  const before = pbx;
  pbx = pbx.replace(
    /IPHONEOS_DEPLOYMENT_TARGET = [\d.]+;/g,
    `IPHONEOS_DEPLOYMENT_TARGET = ${DEPLOYMENT_TARGET};`,
  );
  const { version, iosBuild } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  pbx = pbx.replace(/MARKETING_VERSION = [\d.]+;/g, `MARKETING_VERSION = ${version};`);
  // Build number lives in package.json ("iosBuild") so it survives an ios/
  // regeneration and is bumped in git; App Store Connect rejects a reused one.
  if (Number.isInteger(iosBuild)) {
    pbx = pbx.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${iosBuild};`);
  }
  // Team + entitlements go into the App target's Debug/Release build settings.
  // `INFOPLIST_FILE = App/Info.plist;` appears exactly there, so anchor on it.
  if (!pbx.includes('DEVELOPMENT_TEAM =')) {
    pbx = pbx.replace(
      /(\t+)INFOPLIST_FILE = App\/Info\.plist;/g,
      `$1DEVELOPMENT_TEAM = ${DEVELOPMENT_TEAM};\n$1INFOPLIST_FILE = App/Info.plist;`,
    );
  }
  if (!pbx.includes('CODE_SIGN_ENTITLEMENTS =')) {
    pbx = pbx.replace(
      /(\t+)INFOPLIST_FILE = App\/Info\.plist;/g,
      `$1CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n$1INFOPLIST_FILE = App/Info.plist;`,
    );
  }
  if (pbx !== before) {
    writeFileSync(pbxprojPath, pbx);
    log(
      `pbxproj: deployment target ${DEPLOYMENT_TARGET}, MARKETING_VERSION ${version}, build ${iosBuild ?? '(unchanged)'}`,
    );
  }

  const podfile = readFileSync(podfilePath, 'utf8');
  const patched = podfile.replace(
    /platform :ios, '[\d.]+'/,
    `platform :ios, '${DEPLOYMENT_TARGET}'`,
  );
  if (patched !== podfile) {
    writeFileSync(podfilePath, patched);
    log(
      `Podfile: platform :ios, '${DEPLOYMENT_TARGET}' (run \`pnpm cap:sync\` to re-run pod install)`,
    );
  }
}

// ------------------------------------------------------------- entitlements
{
  const file = join(appDir, 'App.entitlements');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.applesignin</key>
\t<array>
\t\t<string>Default</string>
\t</array>
</dict>
</plist>
`;
  if (!existsSync(file)) {
    writeFileSync(file, body);
    log('App.entitlements: Sign in with Apple');
  }
  // Xcode only needs the build setting, but listing the file in the App group
  // keeps it visible in the navigator like a hand-added capability would.
  const ruby = `
require 'xcodeproj'
project = Xcodeproj::Project.open(ARGV[0])
app_group = project.main_group['App']
if app_group.files.none? { |f| f.path == 'App.entitlements' }
  app_group.new_file('App.entitlements')
  project.save
  puts 'registered'
else
  puts 'already registered'
end
`;
  try {
    const out = execFileSync('ruby', ['-e', ruby, join(iosApp, 'App.xcodeproj')], {
      encoding: 'utf8',
    }).trim();
    log(`App.entitlements in Xcode project: ${out}`);
  } catch (err) {
    console.warn(
      '[setup-ios] could not register App.entitlements in the project:',
      String(err.message),
    );
  }
}

// ------------------------------------------------------------------ app icon
if (existsSync(iconSrc)) {
  const same = existsSync(iconDst) && readFileSync(iconSrc).equals(readFileSync(iconDst));
  if (!same) {
    copyFileSync(iconSrc, iconDst);
    log('AppIcon: copied public/app-icon-1024.png');
  }
} else {
  console.warn('[setup-ios] public/app-icon-1024.png not found — app icon left as template');
}

// ------------------------------------------------------------- launch screen
{
  const sb = readFileSync(storyboardPath, 'utf8');
  if (sb.includes('image="Splash"')) {
    const { red, green, blue } = LAUNCH_BG;
    const plain = sb
      .replace(
        /<imageView key="view"[^>]*>/,
        '<view key="view" contentMode="scaleToFill" id="snD-IY-ifK">',
      )
      .replace('</imageView>', '</view>')
      .replace(
        /<color key="backgroundColor" systemColor="systemBackgroundColor"\/>/,
        `<color key="backgroundColor" red="${red}" green="${green}" blue="${blue}" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>`,
      )
      .replace(/\s*<image name="Splash" width="\d+" height="\d+"\/>/, '')
      .replace(/\s*<systemColor name="systemBackgroundColor">[\s\S]*?<\/systemColor>/, '')
      .replace(/\s*<capability name="System colors in document resources"[^>]*\/>/, '');
    writeFileSync(storyboardPath, plain);
    log('LaunchScreen: plain #F5F3F4 background');
  }
}

log('done');
