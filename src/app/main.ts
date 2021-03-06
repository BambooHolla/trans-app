import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

platformBrowserDynamic().bootstrapModule(AppModule);

// //AoT优化提高加载速度
// // The browser platform without a compiler
// import { platformBrowser } from '@angular/platform-browser';

// // The app module factory produced by the static offline compiler
// import { AppModuleNgFactory } from './app/app.module.ngfactory';

// // Launch with the app module factory.
// platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
