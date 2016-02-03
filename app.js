var Hexo = require('hexo');
var hexo = new Hexo('./test/testSite',{'debug':false});


hexo.init().then(function(){
    require('./index.js')(hexo);
    console.log('clean');
    return hexo.call('clean',{});
})
.then(function(){
    console.log('generate');
    return hexo.call('generate',{});
})
.then(function(){
    console.log('exit');
    return hexo.exit();
}).catch(function(err){
    return hexo.exit(err);
});
