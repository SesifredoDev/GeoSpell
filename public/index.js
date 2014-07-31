(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var questionTemplate = require("./public/question.hbs");
var leaderboardTemplate = require("./public/leaderboard.hbs");
var startButton = document.getElementById("start");
var mainFrame = document.getElementById("main");
var container = document.getElementById("container");
var API_KEY = "009057c6287f8c80a49053c3c8c2da500b6abb3f9a925a737";
var county = "";

var words = [];
var currentWord = "";
var wrong = false;
var oldWord = "";
var score = 0;
var part = 0;
var lives = 3;
var level = 1;

var getWords = function(level, cb) {
    $.get("/words/" + level, function(words) {
        console.log(words);
       cb(null, words); 
    });
}

var loadQuestion = function() {
    mainFrame.innerHTML = questionTemplate({
        word:currentWord, 
        modernBrowser:false, 
        score:score,
        wrong:wrong,
        oldWord:oldWord,
        lives:lives,
        county:county
    });
    console.log(currentWord);
        var submit = document.getElementById("submit");
        var answer = document.getElementById("answer");
        answer.focus(); // Autofocus
        console.log(submit);
        var s = function() {
            if(answer.value.toLowerCase() === currentWord.toLowerCase()) {
                score += 5;
                wrong = false;
            } else {
                wrong = true;
                lives--;
                oldWord = currentWord;
            }
            part = ++part % 5;
            console.log(part);
            currentWord = words[part];
            if(lives > 0) {
                if(part === 0) {
                    if(level == 16) {
                        loadLevel(level+1);
                    } else {
                        loadLevel(level);
                    }
                } else {
                    loadQuestion();
                }
            } else {
              loadLeaderboard(score);
            }
        };
        submit.addEventListener("click", s);
        answer.addEventListener("keyup", function(e) {
           if(e.keyCode === 13) {
               s();
           } 
        });
};

var loadLevel = function(level) {
    getWords(level, function(err, results) {
        words = results;
        currentWord = words[0];
        loadQuestion();
    });
}

var loadScores = function(globalScores, localScores) {
     container.innerHTML = leaderboardTemplate({
        score:score,
        oldWord:oldWord,
        globalScores:globalScores,
        localScores:localScores,
        showScore:lives === 0,
        county:county
    });
    if(score !== undefined) {
        console.log("fsdfd");
        var submitScoreForm = $("#submit-score-form");
        var submitScore = $("#submit-score");
        console.log(submitScoreForm);
        console.log(submitScore);
        submitScore.on("click", function() {
            $.post("/leaderboard/global", {
              email:document.getElementById("email").value,
              score:score
            });
            if(county) {
                $.post("/leaderboard/" +county, {
                    email:document.getElementById("email").value,
                    score:score
                });
            }
            submitScoreForm.slideUp(); 
        });
    }
};

var loadLeaderboard = function(score) {
    $.get("/leaderboard/global", function(globalScores) {
    globalScores = JSON.parse(globalScores);
 if(county) {
    $.get("/leaderboard/" + county, function(localScores) {
        localScores = JSON.parse(localScores);
        console.log(localScores);
        loadScores(globalScores, localScores);
    });
 } else {
     loadScores(globalScores);
 }
    });
};

var age = document.getElementById("age");
var postcode = document.getElementById("postcode");
var ageGroup = document.getElementById("age-group");
var postcodeGroup = document.getElementById("postcode-group");
$("#openLeaderboard").on("click", function(e) {
    e.preventDefault();
    loadLeaderboard();
});

/**
 * LOAD OF PREVIOUS SETTINGS
 * SAVED IN localStorage
 */

if(localStorage.age) {
    age.value = localStorage.age;
} 
if(localStorage.postcode) {
    postcode.value = localStorage.postcode;
}
if(localStorage.county) {
    county = localStorage.county;
}

startButton.addEventListener("click", function(e) {
    var invalid = false;
    var ageValue = parseInt(age.value);
    if(!postcode.value && postcode.value.test()) {
        invalid = true;
        postcodeGroup.classList.add("has-error");
    }
    if(!ageValue) {
        invalid = true;
        ageGroup.classList.add("has-error");
    } else if(ageValue === 9) {
        level = 2;
    } else if(ageValue === 10) {
        level = 3;
    } else if(ageValue === 11) {
        level = 4;
    } else if(ageValue === 12) {
        level = 5;
    } else if(ageValue === 13) {
        level = 6;
    } else if(ageValue === 14) {
        level = 7; 
    } else if(ageValue === 15) {
        level = 8;
    } else if (ageValue >= 16) {
        level = 9;
    } 
    if(!invalid) {
    }
    if(localStorage) {
        localStorage.age = ageValue;
        localStorage.postcode = postcode.value;
    }
    if(!invalid) {
        console.log(localStorage.postcode !== postcode.value &&localStorage.county !== undefined);
        if(!(localStorage && localStorage.postcode !== postcode.value && localStorage.county !== undefined)) {
            console.log("hi");
            $.get("/postcode/" + postcode.value, function(data) {
                county = data;
                localStorage.county = county;
            });
        }
        loadLevel(level);
    }

});

},{"./public/leaderboard.hbs":10,"./public/question.hbs":11}],2:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":3,"./handlebars/exception":4,"./handlebars/runtime":5,"./handlebars/safe-string":6,"./handlebars/utils":7}],3:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "2.0.0-alpha.4";
exports.VERSION = VERSION;var COMPILER_REVISION = 5;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '>= 2.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function(name) {
    delete this.helpers[name];
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  },
  unregisterPartial: function(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(/* [args, ]options */) {
    if(arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = {data: data};
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function(context, options) {
    // Allow for {{#each}}
    if (!options) {
      options = context;
      context = this;
    }

    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    var contextPath;
    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));

            if (contextPath) {
              data.contextPath = contextPath + i;
            }
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) {
              data.key = key;
              data.index = i;
              data.first = (i === 0);

              if (contextPath) {
                data.contextPath = contextPath + key;
              }
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = {data:data};
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });

  instance.registerHelper('lookup', function(obj, field, options) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
};
exports.createFrame = createFrame;
},{"./exception":4,"./utils":7}],4:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],5:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;
var createFrame = require("./base").createFrame;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  var invokePartialWrapper = function(partial, name, context, hash, helpers, partials, data) {
    if (hash) {
      context = Utils.extend({}, context, hash);
    }

    var result = env.VM.invokePartial.call(this, partial, name, context, helpers, partials, data);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function(i, data) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if(data) {
        programWrapper = program(this, i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(this, i, fn);
      }
      return programWrapper;
    },
    programWithDepth: env.VM.programWithDepth,

    data: function(data, depth) {
      while (data && depth--) {
        data = data._parent;
      }
      return data;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = Utils.extend({}, common, param);
      }

      return ret;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  var ret = function(context, options) {
    options = options || {};
    var helpers,
        partials,
        data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    return templateSpec.main.call(container, context, container.helpers, container.partials, data);
  };

  ret._setup = function(options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function(i) {
    return container.programWithDepth(i);
  };
  return ret;
}

exports.template = template;function programWithDepth(i, data /*, $depth */) {
  /*jshint -W040 */
  var args = Array.prototype.slice.call(arguments, 2),
      container = this,
      fn = container.fn(i);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(container, [context, container.helpers, container.partials, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(container, i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn.call(container, context, container.helpers, container.partials, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":3,"./exception":4,"./utils":7}],6:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],7:[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}

exports.appendContextPath = appendContextPath;
},{"./safe-string":6}],8:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":2}],9:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":8}],10:[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n		<div class=\"col-md-12\">\n			<div class=\"alert alert-success\" role=\"alert\">\n				<b>Well done!</b> You got: "
    + escapeExpression(((helper = helpers.score || (depth0 && depth0.score)),(typeof helper === functionType ? helper.call(depth0, {"name":"score","hash":{},"data":data}) : helper)))
    + ".\n				The answer to the final question was "
    + escapeExpression(((helper = helpers.oldWord || (depth0 && depth0.oldWord)),(typeof helper === functionType ? helper.call(depth0, {"name":"oldWord","hash":{},"data":data}) : helper)))
    + ".\n			</div>\n			<form id=\"submit-score-form\" class=\"well\">\n				<label>Email</label>\n				<input class=\"form-control\" id=\"email\"/>\n				<br/>\n				<button id=\"submit-score\" class=\"btn btn-primary\">Submit</button>\n				<button type=\"button\" class=\"btn btn-success\">Go again!</button>\n			</form>\n		</div>\n	";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n	<div class=\"col-md-6\">\n		<h3 >"
    + escapeExpression(((helper = helpers.county || (depth0 && depth0.county)),(typeof helper === functionType ? helper.call(depth0, {"name":"county","hash":{},"data":data}) : helper)))
    + " Leaderboard</h3>\n	</div>\n	";
},"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n	<div class=\"col-md-6\">	\n		<p>See where you scale against others around "
    + escapeExpression(((helper = helpers.county || (depth0 && depth0.county)),(typeof helper === functionType ? helper.call(depth0, {"name":"county","hash":{},"data":data}) : helper)))
    + "!</p>\n	</div>\n	";
},"7":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n	<div class=\"col-md-6\">\n	<table class=\"table table-bordered\">\n		<tr class=\"active\">\n			<td>#</td>\n			<td>Name</td>\n		</tr>\n		";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.localScores), {"name":"each","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n	</table>\n</div>\n";
},"8":function(depth0,helpers,partials,data) {
  var stack1, functionType="function", escapeExpression=this.escapeExpression;
  return "\n			<tr>\n    			<td>"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n    			<td>\n    				"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    				<span class=\"label label-success\">"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</span>\n   				</td>\n    		</tr>\n		";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<div class=\"row\">\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showScore), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.localScores), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	<div class=\"col-md-6\">\n		<h3>Global Leaderboards</h3>\n	</div>\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.localScores), {"name":"if","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	\n	<div class=\"col-md-6\">\n		<p>See where you scale against others around the globe!</p>\n	</div>\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.localScores), {"name":"if","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<div class=\"col-md-6\">\n	<table class=\"table table-bordered\">\n		<tr class=\"active\">\n			<td>#</td>\n			<td>Name</td>\n		</tr>\n		";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.globalScores), {"name":"each","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n	</table>\n</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":9}],11:[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n    <br/>  \n    <div class=\"alert alert-danger\" role=\"alert\">\n        <b>WRONG</b>: The word was "
    + escapeExpression(((helper = helpers.oldWord || (depth0 && depth0.oldWord)),(typeof helper === functionType ? helper.call(depth0, {"name":"oldWord","hash":{},"data":data}) : helper)))
    + ".\n    </div>\n";
},"3":function(depth0,helpers,partials,data) {
  return "\n        <div class=\"text-center\">\n            <i class=\"fa fa-play-circle fa-4\"></i>\n        </div>\n    ";
  },"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n        <audio controls=\"controls\" autoplay=\"autoplay\">\n            <source src=\"/speech/"
    + escapeExpression(((helper = helpers.word || (depth0 && depth0.word)),(typeof helper === functionType ? helper.call(depth0, {"name":"word","hash":{},"data":data}) : helper)))
    + "?type=mp3\" type=\"audio/mpeg\">\n            <source src=\"/speech/"
    + escapeExpression(((helper = helpers.word || (depth0 && depth0.word)),(typeof helper === functionType ? helper.call(depth0, {"name":"word","hash":{},"data":data}) : helper)))
    + "?type=ogg\" type=\"audio/ogg\">\n            <source src=\"/speech/"
    + escapeExpression(((helper = helpers.word || (depth0 && depth0.word)),(typeof helper === functionType ? helper.call(depth0, {"name":"word","hash":{},"data":data}) : helper)))
    + "?type=wav\" type=\"audio/wav\">\n        </audio>\n    ";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", escapeExpression=this.escapeExpression, buffer = "<div class=\"row\">\n<div class=\"col-md-6\">\n<h3>Lives: <span class=\"label label-warning\">"
    + escapeExpression(((helper = helpers.lives || (depth0 && depth0.lives)),(typeof helper === functionType ? helper.call(depth0, {"name":"lives","hash":{},"data":data}) : helper)))
    + "</span></h3>\n</div>\n<div class=\"col-md-6 text-right\">\n    <h3>Score: <span class=\"label label-success\" style=\"margin-top:-0.2em; vertical-align:middle\">"
    + escapeExpression(((helper = helpers.score || (depth0 && depth0.score)),(typeof helper === functionType ? helper.call(depth0, {"name":"score","hash":{},"data":data}) : helper)))
    + "</span></h3>\n</div>\n</div>\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.wrong), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<div class=\"well\">\n<div style=\"width:300px; margin-left:-152px; left:50%; position:relative\">\n<div class=\"question text-center\">\n    <br/>\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.modernBrowser), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.modernBrowser), {"name":"unless","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n    <br/>\n    <br/>\n    <input style=\"\" class=\"form-control\" type=\"text\" id=\"answer\"/>\n</div>\n<br/>\n<button class=\"btn btn-primary\" id=\"submit\">\n    Submit\n    <i class=\"fa fa-chevron-right\"></i>\n</button>\n</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":9}]},{},[1]);
