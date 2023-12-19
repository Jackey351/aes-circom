const { readFileSync } = require("fs");
const { resolve } = require("path");
const { groth16 } = require("snarkjs");

class Circuit {
    circuit;
    wasmPath;
    wasmInstancePath;
    zkeyPath;
    vkey;

    constructor(circuit) {
        this.circuit = circuit;
        this.vkey = JSON.parse(readFileSync(resolve(__dirname, `../build/${circuit}/${circuit}_vkey.json`), "utf-8"));
        this.zkeyPath = resolve(__dirname, `../build/${circuit}/${circuit}_0001.zkey`);
        this.wasmPath = resolve(__dirname, `../build/${circuit}/${circuit}_js/${circuit}.wasm`);
    }

    async generateProof(inputs) {
        const { proof, publicSignals } = await groth16.fullProve(inputs, this.wasmPath, this.zkeyPath);
        let proofCalldata = await groth16.exportSolidityCallData(proof, publicSignals);
        proofCalldata = JSON.parse("[" + proofCalldata + "]");
        return { proofJson: proof, proofCalldata: proofCalldata, publicSignals: publicSignals };
    }

    async verifyProof(proofJson, publicSignals) {
        const verify = await groth16.verify(this.vkey, publicSignals, proofJson);
        return verify;
    }
}

module.exports = { Circuit };
