import GUI from "lil-gui";
import * as Stats from "stats.js";
import type {Testbed} from "./Testbed";

export interface DebugInfos {
    token: number;
    stepId: number;
    worldHash: string;
    worldHashTime: number;
    snapshotTime: number;
}

export class Gui {
    stats: Stats;
    rapierVersion: string;
    maxTimePanelValue: number;
    stepTimePanel1: Stats.Panel;
    stepTimePanel2: Stats.Panel;
    gui: GUI;
    debugText: HTMLDivElement;

    constructor(testbed: Testbed, simulationParameters: Testbed["parameters"]) {
        // Timings
        this.stats = new Stats();
        this.rapierVersion = testbed.RAPIER.version();
        this.maxTimePanelValue = 16.0;
        // NOTE: we add the same panel twice because it appears the memory use panel is missing
        // on firefox. This means that on firefox we have to show the panel 2 instead of the panel
        // 3. To work around this, we just add the pannel twice so that the 3rd panel on firefox
        // exist and gives the timing information.
        this.stepTimePanel1 = this.stats.addPanel(
            new Stats.Panel("ms (step)", "#ff8", "#221"),
        );
        this.stepTimePanel2 = this.stats.addPanel(
            new Stats.Panel("ms (step)", "#ff8", "#221"),
        );
        this.stats.showPanel(3);
        document.body.appendChild(this.stats.dom);

        var backends = simulationParameters.backends;
        var demos = Array.from(simulationParameters.builders.keys());
        var me = this;

        // For configuring simulation parameters.
        this.gui = new GUI({
            title: "Rapier JS demos",
        });
        this.gui
            .add(simulationParameters, "backend", backends)
            .onChange((backend: string) => {
                testbed.switchToBackend(backend);
            });
        var currDemo = this.gui
            .add(simulationParameters, "demo", demos)
            .onChange((demo: string) => {
                testbed.switchToDemo(demo);
            });
        this.gui
            .add(simulationParameters, "numVelocityIter", 0, 20)
            .step(1)
            .listen();
        this.gui
            .add(simulationParameters, "numPositionIter", 0, 20)
            .step(1)
            .listen();
        this.gui
            .add(simulationParameters, "debugInfos")
            .listen()
            .onChange((value: boolean) => {
                me.debugText.style.visibility = value ? "visible" : "hidden";
            });
        this.gui.add(simulationParameters, "debugRender").listen();
        this.gui.add(simulationParameters, "running").listen();
        this.gui.add(simulationParameters, "step");
        simulationParameters.step = () => {
            simulationParameters.stepping = true;
        };
        this.gui.add(simulationParameters, "takeSnapshot");
        simulationParameters.takeSnapshot = () => {
            testbed.takeSnapshot();
        };
        this.gui.add(simulationParameters, "restoreSnapshot");
        simulationParameters.restoreSnapshot = () => {
            testbed.restoreSnapshot();
        };
        this.gui.add(simulationParameters, "restart");
        simulationParameters.restart = () => {
            testbed.switchToDemo(currDemo.getValue());
        };

        /*
         * Block of text for debug infos.
         */
        this.debugText = document.createElement("div");
        this.debugText.style.position = "absolute";
        this.debugText.innerHTML = "";
        this.debugText.style.top = 50 + "px";
        this.debugText.style.visibility = "visible";
        this.debugText.style.color = "#fff";
        document.body.appendChild(this.debugText);
    }

    setDebugInfos(infos: DebugInfos) {
        let text = "Version " + this.rapierVersion;
        text += "<br/>[Step " + infos.stepId + "]";

        if (infos.worldHash) {
            text += "<br/>World hash (MD5): " + infos.worldHash.toString();
            text += "<br/>World hash time (MD5): " + infos.worldHashTime + "ms";
            text += "<br/>Snapshot time: " + infos.snapshotTime + "ms";
        }
        this.debugText.innerHTML = text;
    }

    setTiming(timing: number) {
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
