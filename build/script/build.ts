import { deleteFolderRecursive } from './index';
import fs from 'fs';
import path from 'path';
import { build, InlineConfig } from 'vite';
import viteCfg from './renderer.config';

const packageCfg = require('../../package.json');
const config = require('../cfg/build.json');

/**  config配置  **/
config.productName = packageCfg.name;
config.appId = `org.${packageCfg.name}`;
config.npmRebuild = true; //是否Rebuild编译
config.asar = true;//是否asar打包
config.publish = [{
    'provider': 'generic',
    'url': 'http://127.0.0.1:3000/'//程序更新地址
}];
let nConf = {
    'appW': 800, //app默认宽
    'appH': 600, //app默认高
    'appBackgroundColor': '#333333', //app默认背景色
    'appUrl': 'http://127.0.0.1:3000/', //程序主访问地址
    'socketUrl': 'http://127.0.0.1:3000/',// 程序socket访问地址
    'updateFileUrl': 'http://127.0.0.1:3000/public/', //更新文件地址
    'updaterCacheDirName': `${packageCfg.toLowerCase()}-updater` //更新文件名称
};

/** win配置 */
config.nsis.displayLanguageSelector = false; //安装包语言提示
config.nsis.menuCategory = false; //是否创建开始菜单目录
config.nsis.shortcutName = packageCfg.name; //快捷方式名称(可中文)
config.nsis.allowToChangeInstallationDirectory = true;//是否允许用户修改安装为位置
config.win.requestedExecutionLevel = ['asInvoker', 'highestAvailable'][0]; //应用权限
config.win.target = [];
// config.win.target.push({ //单文件
//     "target": "portable"
//     // "arch": ["x64"]
// });
config.win.target.push({ //nsis打包
    'target': 'nsis',
    'arch': ['x64']
});
let nsh = '';
if (config.nsis.allowToChangeInstallationDirectory) {
    nsh = '!macro customHeader\n' +
        '\n' +
        '!macroend\n' +
        '\n' +
        '!macro preInit\n' +
        '\n' +
        '!macroend\n' +
        '\n' +
        '!macro customInit\n' +
        '    ReadRegStr $0 HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall" "UninstallString"\n' +
        '    ${If} $0 != ""\n' +
        '       # ExecWait $0 $1\n' +
        '    ${EndIf}\n' +
        '!macroend\n' +
        '\n' +
        '!macro customInstall\n' +
        '\n' +
        '!macroend\n' +
        '\n' +
        '!macro customInstallMode\n' +
        '   # set $isForceMachineInstall or $isForceCurrentInstall\n' +
        '   # to enforce one or the other modes.\n' +
        '   #set $isForceMachineInstall\n' +
        '!macroend';
} else {
    nsh = '; Script generated by the HM NIS Edit Script Wizard.\n' +
        '\n' +
        '; HM NIS Edit Wizard helper defines custom install default dir\n' +
        '!macro preInit\n' +
        '    SetRegView 64\n' +
        '    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\\' + packageCfg.name + '"\n' +
        '    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\\' + packageCfg.name + '"\n' +
        '    SetRegView 32\n' +
        '    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\\' + packageCfg.name + '"\n' +
        '    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\\' + packageCfg.name + '"\n' +
        '!macroend';
}

/** linux配置 **/
config.linux.target = ['AppImage', 'snap', 'deb', 'rpm', 'pacman'][4];
config.linux.executableName = packageCfg.name;

fs.writeFileSync('./build/cfg/build.json', JSON.stringify(config, null, 2));
fs.writeFileSync('./build/cfg/installer.nsh', nsh);
fs.writeFileSync('./src/cfg/config.json', JSON.stringify(nConf, null, 2));

deleteFolderRecursive(path.resolve('dist'));//清除dist

build(viteCfg as InlineConfig)
    .catch(() => {
        console.error('error');
    });