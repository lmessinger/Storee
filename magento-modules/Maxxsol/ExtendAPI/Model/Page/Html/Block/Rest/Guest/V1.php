<?php

/**
 * Description of V1
 *
 * @author Jalal
 */
class Maxxsol_ExtendAPI_Model_Page_Html_Block_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Page_Html_Block {
    
    public function _retrieve() {
        $return = array();
        $blockName = $this->getRequest()->getParam('blockName');
        
        $return['html'] = $this->_getBlockHtml($blockName);
        
        return $return;
    }
    
}
