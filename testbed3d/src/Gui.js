import * as dat from 'dat.gui'
import * as Stats  from "stats.js";

export class Gui {
    constructor(testbed, simulation_parameters) {
        // Timings
        this.stats = new Stats();
        this.maxTimePanelValue = 16.0;
        this.stepTimePanel = this.stats.addPanel(new Stats.Panel('ms (step)', '#ff8', '#221'));
        this.stats.setMode(2);
        document.body.appendChild(this.stats.dom);

        var backends = simulation_parameters.backends;
        var demos = Array.from(simulation_parameters.builders.keys());

        // For configuring simulation parameters.
        this.gui = new dat.GUI({
            name: "Rapier JS demos"
        });
        this.gui.add(simulation_parameters, 'backend', backends)
            .onChange(function(backend) { testbed.switchToBackend(backend) } );
        var currDemo = this.gui.add(simulation_parameters, 'demo', demos)
            .onChange(function(demo) { testbed.switchToDemo(demo) } );
        this.velIter = this.gui.add(simulation_parameters, 'numVelocityIter', 0, 20).step(1).listen();
        this.posIter = this.gui.add(simulation_parameters, 'numPositionIter', 0, 20).step(1).listen();
        this.gui.add(simulation_parameters, 'running', true).listen();
        this.gui.add(simulation_parameters, 'step')
            .onChange(function() { simulation_parameters.stepping = true; });
        this.gui.add(simulation_parameters, 'restart')
            .onChange(function() { testbed.switchToDemo(currDemo.getValue())} )
    }

    setTiming(timing) {
        this.maxTimePanelValue = Math.max(this.maxTimePanelValue, timing);
        this.stepTimePanel.update(timing, this.maxTimePanelValue);
    }

    resetTiming() {
        this.maxTimePanelValue = 1.0;
        this.stepTimePanel.update(0.0, 16.0);
    }
}