import * as dat from 'dat.gui'
import * as Stats from "stats.js";

export class Gui {
    constructor(testbed, simulationParameters) {
        // Timings
        this.stats = new Stats();
        this.rapierVersion = testbed.RAPIER.version();
        this.maxTimePanelValue = 16.0;
        // NOTE: we add the same panel twice because it appears the memory use panel is missing
        // on firefox. This means that on firefox we have to show the panel 2 instead of the panel
        // 3. To work around this, we just add the pannel twice so that the 3rd panel on firefox
        // exist and gives the timing information.
        this.stepTimePanel1 = this.stats.addPanel(new Stats.Panel('ms (step)', '#ff8', '#221'));
        this.stepTimePanel2 = this.stats.addPanel(new Stats.Panel('ms (step)', '#ff8', '#221'));
        this.stats.setMode(3);
        document.body.appendChild(this.stats.dom);

        var backends = simulationParameters.backends;
        var demos = Array.from(simulationParameters.builders.keys());
        var me = this;

        // For configuring simulation parameters.
        this.gui = new dat.GUI({
            name: "Rapier JS demos"
        });
        this.gui.add(simulationParameters, 'backend', backends)
            .onChange(function (backend) {
                testbed.switchToBackend(backend)
            });
        var currDemo = this.gui.add(simulationParameters, 'demo', demos)
            .onChange(function (demo) {
                testbed.switchToDemo(demo)
            });
        this.velIter = this.gui.add(simulationParameters, 'numVelocityIter', 0, 20).step(1).listen();
        this.posIter = this.gui.add(simulationParameters, 'numPositionIter', 0, 20).step(1).listen();
        this.gui.add(simulationParameters, 'debugInfos').listen();
        this.gui.add(simulationParameters, 'running', true).listen();
        this.gui.add(simulationParameters, 'step')
            .onChange(function () {
                simulationParameters.stepping = true;
            });
        this.gui.add(simulationParameters, 'takeSnapshot')
            .onChange(function () {
                testbed.takeSnapshot()
            })
        this.gui.add(simulationParameters, 'restoreSnapshot')
            .onChange(function () {
                testbed.restoreSnapshot()
            })
        this.gui.add(simulationParameters, 'restart')
            .onChange(function () {
                testbed.switchToDemo(currDemo.getValue())
            })


        /*
         * Block of text for debug infos.
         */
        this.debugText = document.createElement('div');
        this.debugText.style.position = 'absolute';
        this.debugText.innerHTML = "";
        this.debugText.style.top = 50 + 'px';
        this.debugText.style.visibility = 'visible';
        document.body.appendChild(this.debugText);
    }

    setDebugInfos(infos) {
        let text = "Version: " + this.rapierVersion;
        text += "<br/>[Step " + infos.stepId + "]";

        if (infos.worldHash) {
            text += "<br/>World hash (CRC32): " + infos.worldHash;
        }
        this.debugText.innerHTML = text;
    }

    setTiming(timing) {
        if (!!timing) {
            this.maxTimePanelValue = Math.max(this.maxTimePanelValue, timing);
            this.stepTimePanel1.update(timing, this.maxTimePanelValue);
            this.stepTimePanel2.update(timing, this.maxTimePanelValue);
        }
    }

    resetTiming() {
        this.maxTimePanelValue = 1.0;
        this.stepTimePanel1.update(0.0, 16.0);
        this.stepTimePanel2.update(0.0, 16.0);
    }
}
