import { logOn } from './modular/log';
import { pathOn } from './modular/path';
import { fileOn } from './modular/file';
import App from './modular/app';
import Global from './modular/global';
import Window from './modular/window';
import Tray from './modular/tray';

App.start().then(async () => {
  // 主要模块
  Global.on();
  Window.on();
  Tray.on();
  logOn();
  // 可选模块
  fileOn();
  pathOn();
  await App.uses([
    import('./modular/session'),
    import('./modular/dialog'),
    import('./modular/menu'),
    import('./modular/update'),
    import('./modular/socket')
  ]);
  // 窗口
  Window.create();
  // 托盘
  Tray.create();
});
