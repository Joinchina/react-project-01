import IDValidator from './IDValidator';
/* import districtCodes from './district-codes'; */

class IDValidatorExt extends IDValidator {

    isValid(id) {
        if (!super.isValid(id)){
            return false;
        }
        return true;
        // const a = Number(id.substr(0, 2));
        // let b = Number(id.substr(2, 2));
        // const c = Number(id.substr(4, 2));
        //  //海南直辖自治县
        //  if(a === 46 && b === 0 ){
        //     b = 90;
        // }
        // return districtCodes[a] && districtCodes[a][b] && districtCodes[a][b].indexOf(c) >= 0;
    }
}

export default new IDValidatorExt();
