$(document).ready(function() {
    $('.bordered').DataTable();
    $('select').formSelect();
    $('.modal').modal();
    $('.tooltipped').tooltip();
    $('.tabs').tabs();
    $('.datepicker').datepicker({
        minDate: new Date(),
        disableWeekends: true
    });
});

function displaySample() {
    var iconName = document.getElementById('iconName').value;
    var color = document.getElementById('iconColor').value;

    document.getElementById('sample').innerHTML = "" +
        "<i class='material-icons " +  color +  " circle medium'>" + iconName +  "</i>";
}

function getAwardList(goalId) {

    document.getElementById('goalId').setAttribute('value', goalId);

    $.ajax({
       url: "/award/getAll",
       type: 'POST',
       success: function(result) {
           $.each(result, function(index, data){
               $('#award').append($("<option/>").val(data.id).text(data.title));
               $('select').formSelect();
           });
       }
    });
}

function displayAward(id) {

    $.ajax({
       url: '/award/get',
        type: 'GET',
        data: {
           id: id
        },
        success: function(result){
            document.getElementById('awardIcon').innerHTML = "" +
                "<i class='material-icons " +  result.iconColor +  " circle small'>" + result.iconName +  "</i>";
        }
    });
}

function getAward(goalId, awardId) {

    var award = document.getElementById('awardIcon'+goalId);
        $.ajax({
            url: '/award/get',
            type: 'GET',
            data: {
                id: awardId
            },
            success: function (data) {
                if (data) {
                    award.innerHTML = "" +
                        "<i class='material-icons circle small " + data.iconColor +
                        " tooltipped' data-position='top' data-tooltip='" + data.title + "'>"
                        + data.iconName + "</i>";
                } else {
                    console.log(award);
                    award.innerHTML = "<span>&nbsp;&nbsp;N/A</span>";
                }
            }
        });
}

function updateProgress(id) {

    var progress = document.getElementById('progress'+id).value;

    $.ajax({
        url: '/goal/updateProgress',
        type: 'GET',
        data: {
            id: id,
            progress: progress
        }
    });
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

function validateGoals() {
    var goal = document.getElementById('goal').value.trim();
    var deadline = document.getElementById('deadline').value.trim();
    if(checkEmpty("Goal ", goal)) return false;
    if(checkEmpty("Deadline ", deadline)) return false;
    else return true;
}

function validateUser() {
    var firstname = document.getElementById('firstName').value.trim();
    var lastname = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();
    if(checkEmpty("First Name ", firstname)) return false;
    if(checkEmpty("Last Name ", lastname)) return false;
    if(checkEmpty("Email ", email)) return false;
    else return true;
}
