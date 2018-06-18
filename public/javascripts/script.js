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