export function del_html(text){
    text = text.replace(/<[^<>]+>/g, '')
    return text
}

export function test(){
    alert(12123)
}


