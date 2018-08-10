const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { spawn, spawnSync, exec } = require("child_process");
// process.env.ComSpec = 'C:/Program Files/Git/usr/bin/bash.exe';
// process.env.ComSpec = 'C: /Windows/System32/WindowsPowerShell/v1.0/powershell.exe';

const now_date = new Date();
const taskId = `.sign.${now_date.toLocaleDateString()}.${now_date
	.toLocaleTimeString()
	.replace(/:/g, "：")}`;

const outputs_apk_dir = path.join(
	__dirname,
	"../platforms/android/build/outputs/apk",
);

	fs
	.readdirSync(outputs_apk_dir)
	.map(name => {
		const file_path = path.join(outputs_apk_dir, name);
		console.log("file_path", file_path);
		if (
			name.endsWith("-release-unsigned.apk") &&
			fs.lstatSync(file_path).isFile()
		) {
			console.log("找到未签名文件：", name);
			return file_path;
		}
	})
	.filter(v => v)
	// 开始签名
	.forEach(signAPK);

function signAPK(file_path) {
	console.log("开始签名", file_path);
	const logStream = fs.createWriteStream(
		__dirname + "/" + taskId + ".jarsigner.log",
	);
	// 需要把jks放入到对应的文件夹之下路径为你的SDK位置，cwd修改为你的SDK位置
	const jarsignerTask = spawn(
		"jarsigner",
		[
			"-verbose",
			"-sigalg",
			"SHA1withRSA",
			"-digestalg",
			"SHA1",
			"-keystore",
			"./picasso-release-key.jks",
			file_path,
			"test",
			// "-J-Dfile.encoding=UTF-8",
		],
		{
			stdio: ["pipe", "pipe", process.stderr],
			cwd: "D:/work/android-sdk_r24.4.1-windows/android-sdk-windows/build-tools/26.0.0",
		},
	);
	// pwd:picasso
	fs.createReadStream(__dirname + "/.sign.pwd").pipe(jarsignerTask.stdin);
	jarsignerTask.stdout.pipe(logStream);
	console.log("密码将自动从 scripts/.sign.pwd 文件读入");

	jarsignerTask.on("close", function() {
		// 签名完成，开始zip对齐，并导出
		reZip(file_path);
	});
}
function reZip(file_path) {
	console.log("开始zip对齐");

	const logStream = fs.createWriteStream(
		__dirname + "/" + taskId + ".zipalign.log",
	);

	const outputFile = file_path.replace(
		"-release-unsigned.apk",
		"-release-signed.apk",
	);
	if (fs.existsSync(outputFile) && fs.lstatSync(outputFile).isFile()) {
		console.log("覆盖输出文件", outputFile);
		fs.unlinkSync(outputFile);
	}

	const zipalignTask = spawn(
		"zipalign",
		["-f","-v", "4", file_path, outputFile],
		{
			stdio: ["pipe", "pipe", process.stderr],
			cwd: "D:/work/android-sdk_r24.4.1-windows/android-sdk-windows/build-tools/26.0.0",
		},
	);
	fs.createReadStream(__dirname + "/.sign.pwd").pipe(zipalignTask.stdin);
	zipalignTask.stdout.pipe(logStream);

	zipalignTask.on("close", function() {
		console.log("DONE");
	});
}
