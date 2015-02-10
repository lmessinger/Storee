jQuery(function($){
    
});

var maxAnimator = {
    time: 325,
    position: 'right',
    TryParseInt:function (str, defaultValue){     
        var retValue = defaultValue;     
        if(str!=null){         
            if(str.length>0){             
                if (!isNaN(str)){                 
                    retValue = parseInt(str);             
                }         
            }    
        }     
        return retValue; 
    },
    getCssObj: function ($scope){
	
        var positionEnter = "";
        var positionFinal = "";
        var positionLeave = "";
        var transformStart = "";
        var transformEnd = "";
	
        switch ($scope.position) {
            case "Top":
                positionEnter = "top: -100%";
                positionFinal = "top: 0";
                positionLeave = "top: 100%";
                break;
            case "Bottom":
                positionEnter = "top: 100%";
                positionFinal = "top: 0";
                positionLeave = "top: -100%";
                break;
            case "Left":
                positionEnter = "left: -100%";
                positionFinal = "left: 0";
                positionLeave = "left: 100%";
                break;
            case "Right":
                positionEnter = "left: 100%";
                positionFinal = "left: 0";
                positionLeave = "left: -100%";
                break;
        }
	
        return {
            time: this.TryParseInt(this.time, 1000) + 'ms',
            easing: 'cubic-bezier(' + this.easing + ')',
            position: this.position.toLowerCase(),
            positionvalue: '-50px',
            transformStart: transformStart,
            transformEnd: transformEnd,
            positionEnter: positionEnter,
            positionFinal: positionFinal,
            positionLeave: positionLeave
        }; 
    }
}