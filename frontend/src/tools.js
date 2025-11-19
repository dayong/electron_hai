function del_before(text){
    text = text.replace(/^[^{}]+\{/g, '{')
    return text;
}

function del_after(text){
    text = text.replace(/\}[^{}]+$/g, '}')
    return text;
}

export function del_html(text){
    text = text.replace(/<[^<>]+>/g, '');
    text = del_before(text);
    text = del_after(text);
    return text
}

export function test(){
    alert(12123)
}


