
  ;(function(){
  let u=void 0,isReady=false,onReadyCallbacks=[],isServiceReady=false,onServiceReadyCallbacks=[];
  const __uniConfig = {"pages":[],"globalStyle":{"backgroundColor":"#F8F8F8","background":"#efeff4","navigationBar":{"backgroundColor":"#F8F8F8","titleText":"uni-app","type":"default","titleColor":"#000000"},"isNVue":false},"nvue":{"compiler":"uni-app","styleCompiler":"uni-app","flex-direction":"column"},"renderer":"auto","appname":"sport_help","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":true},"compilerVersion":"4.29","entryPagePath":"pages/Login/Login","entryPageQuery":"","realEntryPagePath":"","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000},"tabBar":{"position":"bottom","color":"#999999","selectedColor":"#333333","borderStyle":"black","blurEffect":"none","fontSize":"10px","iconWidth":"24px","spacing":"3px","height":"50px","list":[{"pagePath":"pages/Home/Home","text":"首页","iconPath":"/static/icon/home.png","selectedIconPath":"/static/icon/home.png"},{"pagePath":"pages/Friends/Friends","text":"好友","iconPath":"/static/icon/friend.png","selectedIconPath":"/static/icon/friend.png"},{"pagePath":"pages/Sports/Sports","text":"运动","iconPath":"/static/icon/sport.png","selectedIconPath":"/static/icon/sport.png"},{"pagePath":"pages/My_info/My_info","text":"我的","iconPath":"/static/icon/my_info.png","selectedIconPath":"/static/icon/my_info.png"}],"backgroundColor":"#FFFFFF","selectedIndex":0,"shown":true},"locales":{},"darkmode":false,"themeConfig":{}};
  const __uniRoutes = [{"path":"pages/Login/Login","meta":{"isQuit":true,"isEntry":true,"enablePullDownRefresh":false,"navigationBar":{"titleText":"登录页面","type":"default"},"isNVue":false}},{"path":"pages/index/index","meta":{"navigationBar":{"titleText":"uni-app","type":"default"},"isNVue":false}},{"path":"pages/Register/Register","meta":{"enablePullDownRefresh":false,"navigationBar":{"titleText":"注册页面","type":"default"},"isNVue":false}},{"path":"pages/FirstLogin/FirstLogin","meta":{"enablePullDownRefresh":false,"navigationBar":{"titleText":"个人属性设置","type":"default"},"isNVue":false}},{"path":"pages/Home/Home","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":0,"enablePullDownRefresh":false,"navigationBar":{"titleText":"主页","type":"default"},"isNVue":false}},{"path":"pages/Friends/Friends","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":1,"enablePullDownRefresh":false,"navigationBar":{"titleText":"好友","type":"default"},"isNVue":false}},{"path":"pages/Sports/Sports","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":2,"enablePullDownRefresh":false,"navigationBar":{"titleText":"运动","type":"default"},"isNVue":false}},{"path":"pages/My_info/My_info","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":3,"enablePullDownRefresh":false,"navigationBar":{"titleText":"我的","type":"default"},"isNVue":false}},{"path":"pages/Search/Search","meta":{"enablePullDownRefresh":false,"navigationBar":{"titleText":"搜索","type":"default"},"isNVue":false}}].map(uniRoute=>(uniRoute.meta.route=uniRoute.path,__uniConfig.pages.push(uniRoute.path),uniRoute.path='/'+uniRoute.path,uniRoute));
  __uniConfig.styles=[];//styles
  __uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  __uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:16})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:u,window:u,document:u,frames:u,self:u,location:u,navigator:u,localStorage:u,history:u,Caches:u,screen:u,alert:u,confirm:u,prompt:u,fetch:u,XMLHttpRequest:u,WebSocket:u,webkit:u,print:u}}}}); 
  })();
  