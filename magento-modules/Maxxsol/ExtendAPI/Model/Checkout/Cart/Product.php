<?php

/**
 * Description of Product
 *
 * @author Jalal
 */
class Maxxsol_ExtendAPI_Model_Checkout_Cart_Product extends Mage_Api2_Model_Resource {

    public function _retrieveCollection() {
        
        try {
            /* return length only */
            Mage::app();
            Mage::app()->setCurrentStore(1);
            Mage::getSingleton('core/session', array('name' => 'frontend'));
           $cart = Mage::getSingleton('checkout/cart');
           $cart->init();
           return $cart->getItemsCount();
            
        } catch (Exception $ex) {
            echo $ex->getMessage();
            return "0";
        };
    }
    
    public function _create(array $filteredData) {
        try {
            Mage::app();
            Mage::app()->setCurrentStore(1);

            Mage::getSingleton('core/session', array('name' => 'frontend'));

//            $session = Mage::getSingleton('checkout/session');
//            $quote = $session->getQuote();

            $cart = Mage::getSingleton('checkout/cart');
            $cart->init();

            $prod_id = intval($filteredData['entity_id']);
            $qty = intval($filteredData['qty']);
            $product = Mage::getModel('catalog/product')->load($prod_id);
            $options = array();
            $super_attributes = array();

            foreach ($filteredData['options'] as $option) {
                if ($option['isSuper']) {
                    $super_attributes[$option['id']] = intval($option['value']);
                } else {
                    $options[$option['id']] = intval($option['value']);
                }
            }

            $params = array('product' => $prod_id, 'qty' => $qty, 'options' => $options,
                'super_attribute' => $super_attributes);

            $request = new Varien_Object();
            $request->setData($params);

//            var_dump($request);
//            exit;

            $cart->addProduct($product, $request);
            $cart->save();
            Mage::getSingleton('checkout/session')->setCartWasUpdated(true);
//            echo $quote->getItemsCount();
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function _update(array $filteredData) {
        var_dump($filteredData);
        exit;
    }
    public function _delete() {
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        try {
            Mage::app();
            Mage::app()->setCurrentStore(1);

            Mage::getSingleton('core/session', array('name' => 'frontend'));

            $session = Mage::getSingleton('checkout/session');
            $quote = $session->getQuote();

            $cart = Mage::getSingleton('checkout/cart');
            $cart->init();

            foreach ($quote->getAllItems() as $item) {
                if ($item->getProduct()->getId() == $prod_id) {
                    $itemId = $item->getItemId();
                    $cart->removeItem($itemId)->save();
                    break;
                }
            }
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

}
