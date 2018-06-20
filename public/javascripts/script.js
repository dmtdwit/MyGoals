$(document).ready(function() {
    $('.bordered').DataTable();
    $('select').material_select();
    $('.modal').modal();
    $('.tooltipped').tooltip();
});

function displaySample() {
    var iconName = document.getElementById('iconName').value;
    var color = document.getElementById('iconColor').value;

    document.getElementById('sample').innerHTML = "" +
        "<i class='material-icons " +  color +  " circle medium'>" + iconName +  "</i>";
}


function notify(type,text){
    var n = noty({
        layout: 'topRight',
        theme: 'relax',
        type: type,
        text: text,
        animation: {
            open: {height: 'toggle'},
            close: {height: 'toggle'},
            easing: 'swing', // easing
            speed: 500
        },
        timeout: 5000,
        killer: true,
        maxVisible: 1
    });
}


function displayMessage(message,messageType,timeOut){
    noty({layout:"topRight",text:message,type:messageType,timeout:timeOut})
}

function checkEmpty(fieldname,fieldvalue){
    if(fieldvalue===''||fieldname===null){
        notify('error',fieldname+' cannot be empty');
        return true;
    }
    else return false;
}

function validatePhotoFormat(fileName){
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile==="jpg" || extFile==="jpeg" || extFile==="png"){
        return true;
    }else{
        notify("error","Photo Format Must be either jpg, jpeg or png");
        return false;
    }
}



function validateLoginForm() {
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value.trim();
    if(checkEmpty("Email",email)){
        return false;
    }
    if(checkEmpty("Password",password)){
        return false;
    }
    else{
        return true;
    }
}

function validateAward() {
    var title = document.getElementById('title').value.trim();
    var iconName = document.getElementById('iconName').value.trim();
    var iconColor = document.getElementById('iconColor').value.trim();
    if(checkEmpty("Award Title", title)) return false;
    if(checkEmpty("IconName", iconName)) return false;
    if(checkEmpty("IconColor", iconColor)) return false;
    else return true;
}

function validateProfilePicture() {
    var profilePicture = document.getElementById('profilePicture').value.trim();
    if(profilePicture===''||profilePicture===null){
        return true;
    }else{
        if(!validatePhotoFormat(profilePicture)){
            return false;
        }else{
            return true;
        }
    }
}


