function register(){
    $.get( "views/register.ejs", function( data ) {
        alert( "Load was performed." );
    });
}