$(document).ready(function() {
    $('.bordered').DataTable();
    $('select').formSelect();
    $('.modal').modal();
    $('.tooltipped').tooltip();
    $('.tabs').tabs();
    $('.collapsible').collapsible();
    $('.datepicker').datepicker({
        minDate: new Date(),
        disableWeekends: true
    });
});

function confirmPassword() {

    let newPassword = document.getElementById("newPassword").value;
    let rePassword = document.getElementById("rePassword").value;

    if (newPassword === rePassword) {
        document.getElementById('resultRe').innerHTML = "" +
            "<i class='material-icons text-dw-green-1'>done</i> <span class='text-dw-green-1'> Passwords match. </span>";

    } else {
        document.getElementById('resultRe').innerHTML = "" +
            "<i class='material-icons red-text'>clear</i> <span class='red-text'>Passwords do not match. </span>";
    }
}

function checkPassword(userId, password) {

    $.ajax({
        url: "/user/checkPassword",
        type: 'GET',
        data: {
            userId: userId,
            password: password
        },
        success: function (data) {
            if (data) {
                document.getElementById('resultOld').innerHTML = "" +
                    "<i class='material-icons text-dw-green-1'>done</i> <span class='text-dw-green-1'> Password Verified. </span>";
                    showUpdateBtn();
            } else {
                document.getElementById('resultOld').innerHTML = "" +
                    "<i class='material-icons red-text'>clear</i> <span class='red-text'>Password doesn't match. </span>";
            }
        }
    });
}

function getManager(userId) {
    const manager = document.getElementById('managerOf' + userId);

    $.ajax({
        url: '/user/getManager',
        method: 'GET',
        data: {
            id: userId
        },
        success: function(result) {
            console.log(result);
            manager.innerHTML = "<span>" + result.name +"</span>";
        }
    });
}

function displaySample() {
    const iconName = document.getElementById('iconName').value;
    const color = document.getElementById('iconColor').value;

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

    const award = document.getElementById('awardIcon'+goalId);
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
                    award.innerHTML = "<span>&nbsp;&nbsp;N/A</span>";
                }
            }
        });
}

function getGoalList(userId) {

    let tableBody = document.getElementById('subordinateGoalsOf' + userId);

    $.ajax({
        url: "/goal/getAllGoals",
        type: 'GET',
        data: {
            userId: userId
        },
        success: function(result) {
            $.each(result, function(index, data) {
                tableBody.insertRow(-1).innerHTML = "" +
                    "<td>" + ++index + "</td>" +
                    "<td>" + data.goal + "</td>" +
                    "<td>" + data.goalType + "</td>" +
                    "<td>" + data.goalStatus + "</td>" +
                    "<td>" + data.progress + "%</td>" +
                    "<td><a class='text-dw-green-2' href='/goal/view-log?id=" + data.id + "'><i class='material-icons'>visibility</i></a></td>" +
                    "<td><a class='modal-trigger text-dw-green-1' id='triggerRemarkModal' href='#remarkModal' onclick='getRemarks("+data.id+")'>" +
                        "<i class='material-icons'>visibility</i></a>" +
                    "</td>";
            });
            if(!result.length) {
                tableBody.parentNode.parentNode.innerHTML = "<h5>No Goals</h5>";
            }
        }
    });
}

function getAllSubordinates(userId, managerName) {

    let managerDiv = document.getElementById(managerName);

    $.ajax({
        url: '/user/getAllSubordinates',
        type: 'GET',
        data: {
            userId: userId
        },
        success: function(result) {

            $.each(result, function(index, data){
                let ul = document.createElement('ul');
                    ul.classList.add('collapsible');
                    managerDiv.after(ul);
                ul.innerHTML = "<li class='active'>" +
                        "<div class='collapsible-header dw-blue-1 white-text'>" +
                            "<i class='material-icons'>subdirectory_arrow_right</i> <span class='tab-header'> " +
                                data.name + "\'s Goals</span>" +
                        "</div>" +
                        "<div class='collapsible-body'>" +
                            "<div class='row' id='" + data.name + "'>" +
                                    "<div class='col l12'>" +
                                        "<table class='white'>" +
                                            "<thead>" +
                                                "<th style='width: 5%;'> S. N. </th>" +
                                                "<th style='width: 60%;'> Goal </th>" +
                                                "<th style='width: 10%;'> Type </th>" +
                                                "<th style='width: 10%;'> Status </th>" +
                                                "<th style='width: 5%;'> Progress </th>" +
                                                "<th style='width: 5%;'> Log </th>" +
                                                "<th style='width: 5%;'> Remarks </th>" +
                                            "</thead>" +
                                            "<tbody id='subordinateGoalsOf" + data.id + "'>" +
                                            "</tbody>" +
                                        "</table>" +
                                    "</div>" +
                            "</div>" +
                        "</div>" +
                    "</li>";
                getGoalList(data.id);
                $('.collapsible').collapsible();
                getAllSubordinates(data.id, data.name);
            });
        },
        error: function() {
            console.log("No subordinate");
        }
    })
}

function logModal(goalId, previousValue) {

    $('#logModal').show();

    document.getElementById('progressGoalId').setAttribute('value', goalId);
    const progress = document.getElementById('progress'+goalId).value;
    const progressMade = progress - previousValue;
    document.getElementById('progressMade').setAttribute('value', progressMade);
    document.getElementById('progressValue').setAttribute('value', progress);
}

function updateProgress() {

    const id = document.getElementById('progressGoalId').value;
    const progress = document.getElementById('progressValue').value;
    const remark = document.getElementById('progressRemark').value;

    $.ajax({
        url: '/goal/updateProgress',
        type: 'GET',
        data: {
            id: id,
            progress: progress
        }
    });
}

function getUser(userId) {

    let user = null;
    $.ajax({
        url: "/user/getUser",
        type: "GET",
        async: false,
        data: {
            userId: userId
        },
        success: function (result) {
            user = result;
        }
    });
    return user;
}

function getRemarks(goalId) {

    document.getElementById('goalIdForRemark').setAttribute('value', goalId);
    let remarks = document.getElementById('allRemarks');

    $.ajax({
        url: "/remark/getRemarks",
        type: "GET",
        data: {
            goalId: goalId
        },
        success: function(result) {
            $.each(result, function(index, data){

                let li = document.createElement('li');
                li.classList.add("collection-item", "avatar");
                li.innerHTML = "" +
                    "<i class='material-icons circle dw-green-1'>comment</i>" +
                    "<input id='remarkContent' type='text' class='black-text' value=' " + data.remark + " ' disabled>" +
                    "<strong>" + getUser(data.RemarkById).name + "</strong><em style='font-size: 0.9em;'>" + "   On " + new Date(data.createdAt).toDateString() + "</em>";
                remarks.appendChild(li);
            });
        }
    })
}

function getLogRemarks(logId) {

    document.getElementById('logIdForRemark').setAttribute('value', logId);
    let remarks = document.getElementById('allRemarks');

    $.ajax({
        url: "/logRemark/getLogRemarks",
        type: "GET",
        data: {
            logId: logId
        },
        success: function(result) {
            $.each(result, function(index, data){

                let li = document.createElement('li');
                li.classList.add("collection-item", "avatar");
                li.innerHTML = "" +
                    "<i class='material-icons circle dw-green-1'>comment</i>" +
                    "<input id='remarkContent' type='text' class='black-text' value=' " + data.remark + " ' disabled>" +
                    "<strong>" + getUser(data.RemarkById).name + "</strong><em style='font-size: 0.9em;'>" + "   On " + new Date(data.createdAt).toDateString() + "</em>";
                remarks.appendChild(li);
            });
        }
    })
}

function notify(type,text){
    let n = noty({
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
    let idxDot = fileName.lastIndexOf(".") + 1;
    let extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile==="jpg" || extFile==="jpeg" || extFile==="png"){
        return true;
    }else{
        notify("error","Photo Format Must be either jpg, jpeg or png");
        return false;
    }
}

function validateLoginForm() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
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
    const title = document.getElementById('title').value.trim();
    const iconName = document.getElementById('iconName').value.trim();
    const iconColor = document.getElementById('iconColor').value.trim();
    if(checkEmpty("Award Title", title)) return false;
    if(checkEmpty("IconName", iconName)) return false;
    if(checkEmpty("IconColor", iconColor)) return false;
    else return true;
}

function validateProfilePicture() {
    const profilePicture = document.getElementById('profilePicture').value.trim();
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
