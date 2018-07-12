const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const prettier = require("prettier");
const __project_path = path.resolve(__dirname + "/../") + path.sep;
const prettierConfig = JSON.parse(
  fs.readFileSync(__dirname + "/../.prettierrc"),
);

function connectHandles(...handles) {
  return function(...args) {
    handles.forEach(handle => handle(...args));
  };
}

function GitGetDiffFiles(options, pipeHandle) {
  const ls_changed = spawn("git", ["diff", "--name-only"]);

  var data_cache = "";
  ls_changed.stdout.on("data", data => {
    data_cache += data.toString();
    // console.log(`STDOUT: ${data}`);
    const list = data_cache.split("\n");
    data_cache = list.pop(); //保留最后一行，最后一行可能不是完整行
    // console.log('list', list);
    pipeHandle(list);
  });

  ls_changed.stderr.on("data", data => {
    // 这里将会收到git的warn与error
    // console.log(`STDERR: ${data}`);
  });

  ls_changed.stdout.on("end", () => {
    const list = data_cache.split("\n").filter(line => line);
    // console.log('list', list);
    pipeHandle(list);
  });

  // ls_changed.on('close', code => {
  //   console.log(`child process exited with code ${code}`);
  // });
}
function GetGetNewFiles(options, pipeHandle) {
  const ls_changed = spawn("git", [
    "ls-files",
    "-o",
    "--exclude-standard",
    "--full-name",
  ]);

  var data_cache = "";
  ls_changed.stdout.on("data", data => {
    data_cache += data.toString();
    // console.log(`STDOUT: ${data}`);
    const list = data_cache.split("\n");
    data_cache = list.pop(); //保留最后一行，最后一行可能不是完整行
    // console.log('list', list);
    pipeHandle(list);
  });

  ls_changed.stderr.on("data", data => {
    // 这里将会收到git的warn与error
    // console.log(`STDERR: ${data}`);
  });

  ls_changed.stdout.on("end", () => {
    const list = data_cache.split("\n").filter(line => line);
    // console.log('list', list);
    pipeHandle(list);
  });
}
function GetGetNeedFormatFiles(options, pipeHandle) {
  GitGetDiffFiles(options, pipeHandle);
  GetGetNewFiles(options, pipeHandle);
}

function FilterFilePath(options, pipeHandle) {
  return function(file_path_list) {
    pipeHandle(
      file_path_list
        .map(file_path => {
          if (file_path.startsWith(__project_path)) {
            file_path = file_path.replace(__project_path, "");
          }
          return file_path;
        })
        .filter(options.filter),
    );
  };
}

function FormatFile(options, pipeHandle) {
  const _prettierConfig = Object.assign(
    {},
    prettierConfig,
    options.prettierConfig,
  );
  return function(file_path_list) {
    // pipeHandle(file_path_list.filter(options.filter));
    file_path_list.forEach(file_path => {
      if (!file_path.startsWith(__project_path)) {
        file_path = path.resolve(__dirname + "/../" + file_path);
      }
      const startDate = new Date();

      function runPipeHandle(error) {
        const endDate = new Date();
        pipeHandle({
          file_path,
          duration: endDate - startDate,
          error,
        });
      }
      fs.readFile(file_path, (read_file_err, file_content) => {
        if (read_file_err) {
          runPipeHandle(read_file_err);
        } else {
          try {
            const formatedCode = prettier.format(
              file_content.toString(),
              _prettierConfig,
            );
            fs.writeFile(file_path, formatedCode, err => {
              runPipeHandle(err);
            });
          } catch (prettier_err) {
            runPipeHandle(prettier_err);
          }
        }
      });
    });
  };
}

function GetAllFile(options, pipeHandle) {
  const root_dir = path.resolve(__dirname + "/../" + options.dir);

  function innerLoop(dir) {
    const ls = fs.readdirSync(dir);
    const file_path_list = ls
      .map(name => {
        const file_path = path.join(dir, name);
        if (fs.lstatSync(file_path).isFile()) {
          return file_path;
        } else {
          setImmediate(innerLoop.bind(null, file_path));
        }
      })
      .filter(v => v);
    pipeHandle(file_path_list);
  }
  innerLoop(root_dir);
}

function LogFormatRes(format_res) {
  console.log(format_res.file_path);
  if (format_res.error) {
    console.error(format_res.error.stack);
  }
  console.log("use time:", format_res.duration, "ms");
  console.log("---------");
}

function LogFormat(log) {
  const log_file_path = path.resolve(__dirname + "/.format-log.log");
  if (!fs.existsSync(log_file_path)) {
    fs.writeFileSync(log_file_path, "## 每次运行format.js都会在这里记录\n");
  }
  fs.appendFileSync(
    __dirname + "/.format-log.log",
    new Date().toLocaleString() + ": " + log + "\n",
  );
}

if (process.argv.indexOf("--from-git-diff") !== -1) {
  // 获取所有变动的文件
  GetGetNeedFormatFiles(
    {},
    connectHandles(
      //过滤TS文件
      FilterFilePath(
        {
          filter: file_path =>
            file_path.startsWith("src/") && file_path.endsWith(".ts"),
        },
        // 格式化文件
        FormatFile(
          {
            prettierConfig: {
              parser: "typescript",
            },
          },
          // 输出格式化结果
          LogFormatRes,
        ),
      ),
      //过滤CSS文件
      FilterFilePath(
        {
          filter: file_path =>
            file_path.startsWith("src/") && file_path.endsWith(".scss"),
        },
        // 格式化文件
        FormatFile(
          {
            prettierConfig: {
              parser: "scss",
            },
          },
          // 输出格式化结果
          LogFormatRes,
        ),
      ),
    ),
  );
  LogFormat("DIFF");
} else if (process.argv.indexOf("--all") !== -1) {
  // 获取所有src的文件
  GetAllFile(
    {
      dir: "src",
    },
    connectHandles(
      //过滤TS文件
      FilterFilePath(
        {
          filter: file_path => {
            return (
              file_path.startsWith("src" + path.sep) &&
              file_path.endsWith(".ts")
            );
          },
        },
        // 格式化文件
        FormatFile(
          {
            prettierConfig: {
              parser: "typescript",
            },
          },
          // 输出格式化结果
          LogFormatRes,
        ),
      ),
      //过滤CSS文件
      FilterFilePath(
        {
          filter: file_path => {
            return (
              file_path.startsWith("src" + path.sep) &&
              file_path.endsWith(".scss")
            );
          },
        },
        // 格式化文件
        FormatFile(
          {
            prettierConfig: {
              parser: "scss",
            },
          },
          // 输出格式化结果
          LogFormatRes,
        ),
      ),
    ),
  );
  LogFormat("ALL");
}
