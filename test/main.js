import { describeTabTreeStoreTests } from './tab-tree-store-test'
import { describeLearningVueTests } from './learning-vue-test'

var css = document.createElement('link');
css.rel = "stylesheet";
css.href = "mocha.css";
document.getElementsByTagName('head')[0].appendChild(css);

var script = document.createElement('script');
script.src = 'mocha.js';
script.type = 'text/javascript';

script.onload = function () {
  mocha.setup('bdd');

  describeTabTreeStoreTests();
  describeLearningVueTests();

  mocha.checkLeaks();
  mocha.run();
}

document.getElementsByTagName('body')[0].appendChild(script);
