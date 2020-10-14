const colors = require('colors');
const cp = require('child_process');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
let tempConfig = null;
try {
    tempConfig = require('./config.json');
} catch (error) {
    console.log('please configure your config.json file by completing the prompts...\n'.yellow.underline);
}
const config = tempConfig;
const appLocation = (config) ? config.appLocation : null;
const winnebago = (config) ? config.winnebago : null;
const mira = (config) ? config.mira : null;
const eclipse = (config) ? config.eclipse : null;
const miraAndEclipse = (config) ? config.miraAndEclipse : null;
const userSetup = {};
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function start() {
    if (!config.colors) colors.disable();
    colors.setTheme({
        favorite: [config.favorite]
    });
    await question().then(async (input) => {
        await decipherInput(input).then(async (results) => {
            if ((results[1] === 'release' || results[1] === 'serve' || results[1] === 'build') && results[0] !== null) processInput(results[0], results[1]);
            return;
        });
    });
}

async function question() {
    const question = await new Promise((resolve, reject) => {
        interface.question("What app(s) would you like to build? \n".favorite.underline, async (userInput) => {
            const input = userInput.toLowerCase();
            resolve(input)
        })
    })
    return question;
}

async function decipherInput(input) {
    let command = null;
    let app = null;
    input = input.replace(/\s/g, '');
    input = input.replace(' and ', '');
    // remove any modifier and update the command variable with it
    if (input.indexOf('release') !== -1) {
        command = 'release'
        input = input.replace('release', '');
    } else if (input.indexOf('serve') !== -1) {
        command = 'serve'
        input = input.replace('serve', '');
    } else if (input.indexOf('build') !== -1) {
        command = 'build'
        input = input.replace('build', '');
    } else {
        command = 'build'
    }

    switch (input) {
        case 'winnebago':
        case 'win':
        case 'wgo':
        case 'w':
            app = 'winnebago';
            console.log('preparing', 'winnebago'.blue, command.cyan + '...');
            break;
        case 'mira':
        case 'm':
            app = 'mira';
            console.log('preparing', 'mira'.blue, command.cyan + '...');
            break;
        case 'eclipse':
        case 'e':
            app = 'eclipse'
            console.log('preparing', 'eclipse'.blue, command.cyan + '...');
            break;
        case 'miraeclipse':
        case 'eclipsemira':
        case 'both':
        case 'me':
        case 'em':
        case 'b':
            app = 'both';
            console.log('preparing', 'mira & eclipse'.blue, command.cyan + 's'.cyan + '...');
            break;
        case 'clear':
        case 'cls':
        case 'c':
            console.clear();
            start();
            break;
        case 'help':
        case 'h':
            console.table({
                version: {
                    command: "version | v",
                    description: "list of versions used"
                },
                help: {
                    command: "help | h",
                    description: "list of all commands available"
                },
                winnebago: {
                    command: "winnebago | wgo | win | w",
                    description: `build out the mira app from your "${winnebago}" folder`
                },
                mira: {
                    command: "mira | m",
                    description: `build out the mira app from your "${mira}" folder`
                },
                eclipse: {
                    command: "eclipse | e",
                    description: `build out the eclipse app from your "${eclipse}" folder`
                },
                both: {
                    command: "both | b | m e | e m | mira eclipse | eclipse mira",
                    description: "build out both mira and eclipse"
                },
                release: {
                    command: "release + app",
                    description: "a modifier that creates a release .apk for desired app"
                },
                serve: {
                    command: "serve + app",
                    description: "a modifier that serves the app to the browser"
                },
                build: {
                    command: "build + app",
                    description: "a modifier that creates a build for the desired app (not necessary)"
                },
                config: {
                    command: "config | config.json",
                    description: "display all config.json data"
                },
                cmd: {
                    command: "cmd",
                    description: "run command prompt commands within the app"
                },
                directory: {
                    command: "cwd",
                    description: "display the current working directory"
                },
                close: {
                    command: "close | exit | stop | kill | end | quit",
                    description: "these commands will close the app"
                },
                setup: {
                    command: "setup",
                    description: "will allow you to reconfigure your config.json settings"
                },
                clean: {
                    command: "clean | cleanview | clean view",
                    description: "updates your cleanView variable in your config.json"
                },
                colors: {
                    command: "colors | color",
                    description: "updates your colors variable in your config.json"
                },
                favorite: {
                    command: "favorite | fav",
                    description: "updates your favorite variable in your config.json"
                },
                clear: {
                    command: "clear | cls | c",
                    description: "clear the console"
                },
            });
            start();
            break;
        case 'cwd':
            console.log(process.cwd());
            start();
            break;
        case 'cmd':
            console.warn('run commands at your own risk'.red);
            getCmd();
            start();
            break;
        case 'config':
            console.table(config);
            let cwd = process.cwd()
            let curDir = process.cwd().split('\\').slice(-1)[0];
            if (curDir === miraAndEclipse && miraAndEclipse !== appLocation) {
                process.chdir(`../${appLocation}`);
            } else if (curDir === 'client') {
                process.chdir(`../../${appLocation}`);
            }
            cp.exec(`explorer ${cwd}`)
            if (appLocation !== miraAndEclipse) process.chdir(`../${miraAndEclipse}`);
            start();
            break;
        case 'version':
        case 'v':
            console.log('app version:', 'v1.0.1'.green);
            console.table({
                location: process.cwd(),
                node: cp.execSync('node -v').toString().replace('\r', '').replace('\n', ''),
                cordova: cp.execSync('cordova -v').toString().replace('\r', '').replace('\n', ''),
                ionic: cp.execSync('ionic -v').toString().replace('\r', '').replace('\n', ''),
            });
            process.chdir(`../${winnebago}/client`);
            console.table({
                location: process.cwd(),
                node: cp.execSync('node -v').toString().replace('\r', '').replace('\n', ''),
                cordova: cp.execSync('cordova -v').toString().replace('\r', '').replace('\n', ''),
                ionic: cp.execSync('ionic -v').toString().replace('\r', '').replace('\n', ''),
            });
            process.chdir(`../../${mira}/client`);
            console.table({
                location: process.cwd(),
                node: cp.execSync('node -v').toString().replace('\r', '').replace('\n', ''),
                cordova: cp.execSync('cordova -v').toString().replace('\r', '').replace('\n', ''),
                ionic: cp.execSync('ionic -v').toString().replace('\r', '').replace('\n', ''),
            });
            process.chdir(`../../${eclipse}/client`);
            console.table({
                location: process.cwd(),
                node: cp.execSync('node -v').toString().replace('\r', '').replace('\n', ''),
                cordova: cp.execSync('cordova -v').toString().replace('\r', '').replace('\n', ''),
                ionic: cp.execSync('ionic -v').toString().replace('\r', '').replace('\n', ''),
            });
            process.chdir(`../../${miraAndEclipse}`);
            start();
            break;
        case 'close':
        case 'exit':
        case 'stop':
        case 'kill':
        case 'quit':
        case 'end':
            terminateCli();
            start();
            break;
        case 'clean':
        case 'cleanview':
        case 'clean view':
            await getCleanView();
            console.log('your cleanView setting is now set to:'.green, userSetup.cleanView.toString().magenta);
            terminateCli();
            start();
            break;
        case 'color':
        case 'colors':
            await getColors();
            userSetup.colors ? colors.enable() : colors.disable();
            console.log('your colors setting is now set to:'.green, userSetup.colors.toString().magenta);
            terminateCli();
            start();
            break;
        case 'favorite':
        case 'fav':
            await getFavorite();
            colors.setTheme({
                favorite: [userSetup.favorite]
            });
            console.log('your favorite setting is now set'.favorite);
            terminateCli();
            start();
            break;
        case 'setup':
            console.log('start setup...');
            await setup();
            break;
        default:
            console.error(input.cyan, "is not a valid input".red, `\ntype ${'help'.green} ${'to get a list of commands'.cyan}`.cyan);
            start();
            break;
    }
    return [app, command]
}

async function processInput(app, action) {
    const appPath = getAppPath(app);

    // change to wanted path
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[0]}/client`);
        await startAction(app, action, appPath[0], 'mira');
    } else {
        process.chdir(`../${appPath}/client`);
        await startAction(app, action, appPath)
    }

    // change back to original directory
    process.chdir(`../../${miraAndEclipse}`);

    // build second app if both was chosen by user
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[1]}/client`);
        await startAction(app, action, appPath[1], 'eclipse');
        process.chdir(`../../${miraAndEclipse}`);
    }

    // tasks are finished and app should automatically start again
    start();
}

async function startAction(app, action, currentApp, displayName = null) {
    if (displayName === null) displayName = app;
    try {
        const startTime = new Date();
        const startTimeFormatted = startTime.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        console.log(displayName.blue, action.cyan, 'starting in', process.cwd().cyan, 'at', startTimeFormatted.magenta);
        // run command
        let data = null;
        if (action === 'build') data = cp.execSync('cordova run android');
        if (action === 'release') {
            const appVariables = fs.readFileSync('./www/appVariables.js').toString();
            const configXml = fs.readFileSync('./config.xml').toString();
            const splitConfigXml = configXml.split(' ');
            let androidVersionCode;
            splitConfigXml.forEach(string => {
                if (string.indexOf('android-versionCode=') !== -1) androidVersionCode = string.split('"')[1];
            });
            console.log('android-versionCode:'.grey, androidVersionCode.cyan)
            if (displayName === 'mira' && androidVersionCode.length !== 10) {
                console.error('version code length is incorrect, please check android-versionCode in the config.xml file'.red)
            } else if (displayName === 'eclipse' && androidVersionCode.length !== 8) {
                console.error('version code length is incorrect, please check android-versionCode in the config.xml file'.red)
            }
            if (appVariables.indexOf('production = false') !== -1) {
                console.warn('production is set to:'.yellow, 'false'.red);
                const gitBranchArray = cp.execSync('git branch').toString().replace(/\n/g, ' ').split(' ').filter(string => string !== '');
                const activeBranchIndex = gitBranchArray.indexOf('*') + 1;
                if (gitBranchArray[activeBranchIndex].toLowerCase() === 'master') {
                    const decision = await prompt(`${'Would you like to update the'.magenta} ${'production'.red} ${'variable to'.magenta} ${'true'.yellow} ${'(y/n)'.red}${'?\n'.magenta}`);
                    if (decision) {
                    let newAppVariables = appVariables.replace('production = false', 'production = true');
                    fs.writeFileSync('./www/appVariables.js', newAppVariables);
                    console.log('appVariables.js production variable updated'.green);
                    } else {
                        console.log('appVariables.js production variable not updated'.red);
                    }
                }
            } else if (appVariables.indexOf('production = true') !== -1) {
                console.warn('production is set to:'.yellow, 'true'.red);
            }
            data = cp.execSync('cordova build android --release');
            const dataArray = data.toString().replace(/\r/g, '').replace(/\n/g, '').split('\t').filter(string => string !== '')
            let apkPath = undefined;
            let unsignedApkPath = undefined;
            dataArray.forEach(string => {
                if (string.indexOf('app-release.apk') !== -1) apkPath = string.replace('\\app-release.apk', '');
                if (string.indexOf('app-release-unsigned.apk') !== -1) unsignedApkPath = string.replace('\\app-release-unsigned.apk', '');
            });
            if (apkPath) {
                console.log('apk path:'.gray, apkPath.cyan)
                cp.exec(`explorer ${apkPath}`);
            } else if (unsignedApkPath) {
                console.log('release apk path not found'.red)
                cp.exec(`explorer ${unsignedApkPath}`);
            } else {
                console.log('no apk path not found'.red)
            }
        }
        if (action === 'serve') {
            let appVariables = fs.readFileSync('./www/appVariables.js').toString();
            if (appVariables.indexOf('configBuildMode = false') !== -1) {
                console.warn('configBuildMode is set to:'.yellow, false.toString().red, '\nyou will probably want to change this setting...'.cyan);
                let newAppVariables = appVariables.replace('configBuildMode = false', 'configBuildMode = true');
                const decision = await prompt(`${'Would you like to update the'.magenta} ${'configBuildMode'.red} ${'variable to'.magenta} ${'true'.yellow} ${'(y/n)'.red}${'?\n'.magenta}`);
                if (decision) {
                    fs.writeFileSync('./www/appVariables.js', newAppVariables);
                    console.log('appVariables.js configBuildMode variable updated'.green);
                } else {
                    console.log('appVariables.js configBuildMode variable not updated'.red);
                }
            }
            console.log('you will need to close your terminal or open a new one to gain access to the app again'.yellow);
            data = cp.execSync('ionic serve');
        }
        if (!config.cleanView) console.log(data.toString());
        // update time after build is finished
        const finishTime = new Date();
        const finishTimeFormatted = finishTime.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        switch (currentApp) {
            case winnebago:
                console.log('winnebago'.blue, action.cyan, 'finished with no errors'.green, 'at', finishTimeFormatted.magenta);
                break;
            case mira:
                console.log('mira'.blue, action.cyan, 'finished with no errors'.green, 'at', finishTimeFormatted.magenta);
                break;
            case eclipse:
                console.log('eclipse'.blue, action.cyan, 'finished with no errors'.green, 'at', finishTimeFormatted.magenta);
                break;
            default:
                console.error(action.cyan, 'unknown finished with no errors'.red, 'at', finishTimeFormatted.magenta);
        }
        const gitBranchArray = cp.execSync('git branch').toString().replace(/\n/g, ' ').split(' ').filter(string => string !== '');
        const activeBranchIndex = gitBranchArray.indexOf('*') + 1;
        console.log('branch used:'.gray, gitBranchArray[activeBranchIndex].cyan)
    } catch (error) {
        const disconnectMessage = (error.message.toLowerCase().indexOf("no emulator images") !== -1) ?
            '\nplease make sure your mobile device is connected to your computer'.red :
            '';
        const signatureMessage = (error.message.toLowerCase().indexOf("signatures do not match") !== -1) ?
            '\ntry uninstalling the app before building'.red :
            '';
        const downgradeMessage = (error.message.toLowerCase().indexOf("install_failed_version_downgrade") !== -1) ?
            '\ntry uninstalling the app before building again'.red :
            '';
        if (!config.cleanView) console.error(error);
        console.log('error found'.red, disconnectMessage, signatureMessage, downgradeMessage);
    }
}

async function prompt(message) {
    const question = await new Promise((resolve, reject) => {
        interface.question(message, (userInput) => {
            const input = userInput.toLowerCase();
            let answer = false;
            if (input === 'y' || input === 'yes') {
                answer = true
            }
            resolve(answer)
        })
    })
    return question;
}

async function setup() {
    const getWinnebagoName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'winnebago'.yellow} ${'repository?'.blue}\n`, async (userInput) => {
                userSetup.winnebago = userInput;
                resolve();
            })
        })
    }
    const getMiraName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'mira'.yellow} ${'repository?'.blue}\n`, async (userInput) => {
                userSetup.mira = userInput;
                resolve();
            })
        })
    }
    const getEclipseName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
                userSetup.eclipse = userInput;
                resolve();
            })
        })
    }
    const getMiraEclipseName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'mira / eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
                userSetup.miraAndEclipse = userInput;
                resolve();
            })
        })
    }
    await getWinnebagoName();
    await getMiraName();
    await getEclipseName();
    await getMiraEclipseName();
    await getCleanView(true);
    await getFavorite(true);
    await getColors(true);
    if (!userSetup.colors) colors.disable()
    fs.writeFileSync('./config.json', JSON.stringify({
        "appLocation": path.basename(process.cwd()),
        "winnebago": userSetup.winnebago,
        "mira": userSetup.mira,
        "eclipse": userSetup.eclipse,
        "miraAndEclipse": userSetup.miraAndEclipse,
        "cleanView": userSetup.cleanView,
        "favorite": userSetup.favorite,
        "colors": userSetup.colors,
    }, null, '\t'));
    console.log('\nyou have successfully updated your config.json'.green);
    terminateCli();
}

function terminateCli() {
    // when the config.json is update and app restart is required to pull new data
    console.log('the app will close now...\nyou will need to start the app again to continue'.red);
    process.exit(25);
}

function getCmd() {
    return new Promise((resolve, reject) => {
        interface.question(`What would you like to run in the command prompt?\n`.magenta.underline, userInput => {
            const input = userInput.toLowerCase();
            if (input === 'exit' || input === 'stop' || input === 'quit' || input === 'close' || input === 'kill' || input === 'end') {
                start();
                return;
            } else if (input === 'cwd') {
                console.log(process.cwd());
                getCmd();
                return;
            } else if (input === 'clear' || input === 'cls' || input === 'c') {
                console.clear();
                getCmd();
                return;
            } else if (input === 'help' || input === 'h') {
                console.table({
                    exit: 'exit | stop | quit | close | kill | end'
                });
                getCmd();
                return;
            }
            try {
                const data = cp.execSync(input).toString();
                console.log(data);
            } catch (error) {
                if (!config.cleanView) console.error(error);
                console.error('error found'.red);
            }
            getCmd();
        })
    })
}

function getAppPath(app) {
    let appPath = null;
    if (app === 'winnebago') {
        appPath = winnebago;
    } else if (app === 'mira') {
        appPath = mira;
    } else if (app === 'eclipse') {
        appPath = eclipse;
    } else if (app === 'both') {
        appPath = [mira, eclipse];
    }
    return appPath;
}

function getCleanView(setup = false) {
    return new Promise((resolve, reject) => {
        interface.question(`Would you like ${'extra logs'.yellow} ${'to be displayed when using this app?'.blue} ${'(y/n)'.magenta}\n`.blue, userInput => {
            let input = false;
            if (userInput.toLowerCase() === 'n' || userInput.toLowerCase() === 'no') input = true;
            userSetup.cleanView = input;
            if (!setup) {
                if (path.basename(process.cwd()) !== config.appLocation) process.chdir(`../${config.appLocation}`);
                fs.readFile('./config.json', function (error, data) {
                    let json = JSON.parse(data)
                    json.cleanView = userSetup.cleanView;
                    fs.writeFileSync("./config.json", JSON.stringify(json, null, '\t'));
                    resolve();
                });
            } else {
                resolve();
            }
        })
    })
}

function getColors(setup = false) {
    return new Promise((resolve, reject) => {
        interface.question(`Would you like ${'color'.rainbow} ${'to be used when using this app?'.blue} ${'(y/n)'.magenta}\n`.blue, userInput => {
            let input = true;
            if (userInput.toLowerCase() === 'n' || userInput.toLowerCase() === 'no') input = false;
            userSetup.colors = input;
            if (!setup) {
                if (path.basename(process.cwd()) !== config.appLocation) process.chdir(`../${config.appLocation}`);
                fs.readFile('./config.json', function (error, data) {
                    let json = JSON.parse(data)
                    json.colors = userSetup.colors;
                    fs.writeFileSync("./config.json", JSON.stringify(json, null, '\t'));
                    resolve();
                });
            } else {
                resolve();
            }
        })
    })
}

function getFavorite(setup = false) {
    return new Promise((resolve, reject) => {
        interface.question(`Enter a favorite ${'color'.yellow}\n${'options include:'.blue} ${'cyan'.cyan}, ${'blue'.blue}, ${'green'.green}, ${'red'.red}, ${'white'.white}, ${'magenta'.magenta}, ${'random'.random}, ${'yellow'.yellow}, ${'grey'.grey}, ${'zebra'.zebra}, ${'rainbow'.rainbow}, ${'america'.america}, or ${'trap'.trap} (trap)\n`.blue, userInput => {
            let input;
            console.log('userInput.toLowerCase()', userInput.toLowerCase())
            switch (userInput.toLowerCase()) {
                case 'trap':
                    input = 'trap';
                    break;
                case 'cyan':
                    input = 'cyan';
                    break;
                case 'blue':
                    input = 'blue';
                    break;
                case 'green':
                    input = 'green';
                    break;
                case 'red':
                    input = 'red';
                    break;
                case 'white':
                    input = 'white';
                    break;
                case 'magenta':
                    input = 'magenta';
                    break;
                case 'random':
                    input = 'random';
                    break;
                case 'yellow':
                    input = 'yellow';
                    break;
                case 'gray':
                case 'grey':
                    input = 'grey';
                    break;
                case 'zebra':
                    input = 'zebra';
                    break;
                case 'rainbow':
                    input = 'rainbow';
                    break;
                case 'america':
                    input = 'america';
                    break;
                default:
                    input = 'yellow';
                    break;
            }
            console.log('input', input)
            userSetup.favorite = input;
            if (!setup) {
                if (path.basename(process.cwd()) !== config.appLocation) process.chdir(`../${config.appLocation}`);
                fs.readFile('./config.json', function (error, data) {
                    let json = JSON.parse(data)
                    json.favorite = userSetup.favorite;
                    fs.writeFileSync("./config.json", JSON.stringify(json, null, '\t'));
                    resolve();
                });
            } else {
                resolve();
            }
        })
    })
}

(config) ? start() : setup();