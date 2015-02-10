<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Product_ProductAttributes
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductAttributes extends Mage_Api2_Model_Resource {

    function getProductAttributes($prodId, $include, $exclude) {
        $attributes = array();

        $product = Mage::getModel('catalog/product')->load($prodId);
        $rc = Mage::getResourceModel('catalog/product');

        if (is_array($include) && count($include)) {
            $pAttributes = array_intersect_key($product->getAttributes(), array_flip($include));
        } else if (is_array($exclude) && count($exclude)) {
            $pAttributes = array_diff_key($product->getAttributes(), array_flip($exclude));
        } else {
            $pAttributes = $product->getAttributes();
        }

        foreach ($pAttributes as $code => $attribute) {
            if ($attribute->getIsVisibleOnFront()) {
                $attributes[$code] = array(
                    'code' => $code,
                    'title' => $attribute->getFrontendLabel(),
                    'content' => $product->getResource()->getAttribute($code)->getFrontend()->getValue($product)
                );
            }
        }

        return $attributes;
    }

}
