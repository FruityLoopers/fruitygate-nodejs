FruityBrain (node.js)
==

This is a modified version of [Fruity-Gate](https://github.com/microcosm/fruitygate-nrf) which can be set up as a ***FruityBrain*** - an endpoint to capture and store votes received from nodes on the Bluetooth Fruity Mesh network.

FruityBrain is just piece of the system. An end-to-end setup requires the use of bluetooth nodes [NRF51 devices](https://www.nordicsemi.com/eng/Products/nRF51-Series-SoC) (like [this dongle](https://www.digikey.com/product-detail/en/NRF51-DONGLE/1490-1037-ND/5022448)) set up as voting nodes, gateways and/or persistors. There are more details on how to do this [here](https://github.com/FruityLoopers/fruitymesh).


Setting up vote capturing:
--

To set up vote capturing, the following steps should be followed:

1. Make sure you have one NRF51 device flashed as a gateway plugged into a USB port of the host on which the following commands will be run.

2. On the host, browse to the base directory and start the NodeJS app by running:

    ```
    ./go gateway
    ```

2. Load up the fruitybrain dashboard on your browser at `http://localhost:3001`. This will show the status of all connected nodes on the mesh (based on their last received heartbeat).

3. Configure IDs for the voting boxes and assign nodes to each box on the fruitybrain dashboard by alternately specifying the following fields for each voting node:
    * Box ID *(An ID known to the CMS to track the box's location and to identify sessions)*
    * Node ID *(Unique identifier of each node as seen on the fruitybrain dashboard)*
    * Type *(Specify type of node such as* ***green***, ***red*** *etc)*

4. That's it! You can now view the current configurations for the boxes as well as any recieved votes by clicking the corresponding links on the FruityBrain dashboard. Currently these are displayed as JSON.