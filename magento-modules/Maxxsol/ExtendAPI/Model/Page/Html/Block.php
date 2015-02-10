<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Page_Html_Block
 *
 * @author Jalal
 */
class Maxxsol_ExtendAPI_Model_Page_Html_Block extends Maxxsol_ExtendAPI_Model_Page_Html {

    function _getBlockHtml($blockName) {
        return $this->layout->getBlock($blockName)->toHtml();
    }

}
