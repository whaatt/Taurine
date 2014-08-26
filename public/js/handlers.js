/* Page Handlers */

function welcome(ctx) {
    setContent('welcome');
    setSidebar('welcome');
    setMenuContext('logged-out');
    setActiveMenuLink('welcome');
}

function login(ctx) {
    setContent('login');
    setSidebar('login');
    setMenuContext('logged-out');
    setActiveMenuLink('login');
}

function loginRedirect(ctx) {
    setContent('login');
    setSidebar('login');
    setMenuContext('logged-out');
    setActiveMenuLink('login');
}

function register(ctx) {
    setContent('register');
    setSidebar('register');
    setMenuContext('logged-out');
    setActiveMenuLink('register');
}

function forgot(ctx) {
    setContent('forgot');
    setSidebar('forgot');
    setMenuContext('logged-out');
    setActiveMenuLink('forgot');
}