<?php

/**
 * Description of Html
 *
 * @author Jalal
 */
class Maxxsol_ExtendAPI_Model_Page_Html extends Mage_Api2_Model_Resource {

    var $layout;
    
    public function __construct() {
        Mage::app();      
        Mage::app()->setCurrentStore(1);      
        Mage::getSingleton('core/session', array('name'=>'frontend'));
        
        $this->layout = Mage::app()->getLayout();
        $this->layout->getUpdate()
                ->addHandle('default')
                ->load();

        $this->layout->generateXml()
                ->generateBlocks();
    }
    
}
