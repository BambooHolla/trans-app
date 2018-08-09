
打包：ionic cordova build android --release --prod

jks_key: picasso

找到你的 android-sdk目录，因为我的C盘有权限，所以把打包的apk扔在D盘
D:\work\android-sdk_r24.4.1-windows\android-sdk-windows\build-tools\26.0.0>jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore picasso-release-key.jks d:/android-armv7-release-unsigned.apk test

D:\work\android-sdk_r24.4.1-windows\android-sdk-windows\build-tools\26.0.0>./zipalign -f -v 4 d:/android-armv7-release-unsigned.apk d:/picaex-v0.1.42-release.apk