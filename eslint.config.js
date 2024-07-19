import globals from 'globals';


export default [
    {
        languageOptions: { globals: globals.browser },
        files: ["src/*.js", "src/**/*.js"],
        rules:{
            indent:['error',4],
            quotes: ['error','single'],
            semi: ['error','always'],
            curly: 'error',
            "no-unused-vars": "error"
            }
    },
];