<?php

class Maxxsol_ExtendAPI_Model_Cms_Block_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Cms_Block {

    protected function _retrieveCollection() {
        $block_id = intval($this->getRequest()->getParam('block_id'));

        if (!$block_id) return array();

        $block = $this->_getBlockHtml($block_id);

        return $block;
    }

}
