/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint sub: true */
/**
 * @description ComponentServiceMetricsPlugin
 * @constructor
 */
var ComponentServiceMetricsPlugin = function ComponentServiceMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = false; // Do not enable it automatically
};

ComponentServiceMetricsPlugin.NAME = "componentService";
ComponentServiceMetricsPlugin.prototype = {
    initialize: function (metricsService) {
        this.collector = metricsService;

        if (this["enabled"]) {
            this.bind(metricsService);
        }
    },
    enable: function () {
        if (!this["enabled"]) {
            this["enabled"] = true;
            this.bind(this.collector);
        }
    },
    disable: function () {
        if (this["enabled"]) {
            this["enabled"] = false;
            this.unbind(this.collector);
        }
    },
    bind: function (metricsService) {
        var method      = 'newComponentDeprecated',
            beforeHook  = function (startMark, config) {
                var descriptor;
                if ($A.util.isString(config)) {
                    descriptor = config;
                } else {
                    descriptor = (config["componentDef"]["descriptor"] || config["componentDef"]) + '';
                }
                startMark["context"] = {
                    "descriptor": descriptor
                };
            };

        metricsService.instrument(
            $A.componentService,
            method,
            ComponentServiceMetricsPlugin.NAME,
            false/*async*/,
            beforeHook
        );
    },
    //#if {"excludeModes" : ["PRODUCTION"]}
    postProcess: function () {
        return [];
    },
    // #end
    unbind: function (metricsService) {
        metricsService["unInstrument"]($A.componentService, 'newComponentDeprecated');
    }
};

// Exposing symbols/methods for Google Closure
var p = ComponentServiceMetricsPlugin.prototype;

exp(p,
    "initialize",  p.initialize,
    "enable",      p.enable,
    "disable",     p.disable,
    "postProcess", p.postProcess
);

$A.metricsService.registerPlugin({
    "name"   : ComponentServiceMetricsPlugin.NAME,
    "plugin" : ComponentServiceMetricsPlugin
});
