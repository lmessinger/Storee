<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Category
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Cms_Block extends Mage_Api2_Model_Resource {

    function _getBlockHtml($blockId) {
        $staticBlock = array();

        $html = Mage::getModel('core/layout')->createBlock('cms/block')
                ->setBlockId($blockId)
                ->toHtml();

        if ($html) {
            $staticBlock = array(
                'id' => $blockId,
                'html' => $html
            );
        }

        return $staticBlock;
    }

}
