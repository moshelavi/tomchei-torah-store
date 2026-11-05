const homeBeforeEntrance=getHomeViewHTML;
getHomeViewHTML=function(){return homeBeforeEntrance().replace('<div class="home-design">',`<div class="home-design"><section class="store-entrance" aria-label="ברוכים הבאים לחנות ת״ת תומכי תורה"><img class="store-entrance-photo" src="assets/store-entrance.png" alt="המחשה של חנות חולצות, חליפות ונעלי גברים" fetchpriority="high"><div class="store-entrance-shade"></div><div class="store-entrance-glass">${officialLogo}</div></section>`);};

