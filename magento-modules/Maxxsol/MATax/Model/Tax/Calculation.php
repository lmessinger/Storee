<?php

/**
 * Description of Calculation
 *
 * @author Jalal
 */
class Maxxsol_MATax_Model_Tax_Calculation extends Mage_Tax_Model_Calculation {

    public function calcTaxAmount($price, $taxRate, $priceIncludeTax = false,
            $round = true) {

        $amount = 0;

        $regionModel = Mage::getModel('directory/region')->loadByCode('MA', 'US');
        $regionId = $regionModel->getId(); //Massachuettes region_id

        $shippingData = Mage::getSingleton('checkout/session')->getQuote()->getShippingAddress()->getData();

        if ($price > 175 && $shippingData['region_id'] == $regionId) {
            $amount = $price - 175;
        } else {
            return parent::calcTaxAmount($price, $taxRate, $priceIncludeTax, $round);
        }

        if ($round) {
            return $this->round($amount);
        }

        return $amount;
    }

}
