$(document).ready(function(){
            const render = $("#render");
            const form = $("#form");
            const item_input= $("#item");
            const loading= $("#loading");
            var toEditID;

            function resetForm(){
                item_input.val('');
            }
            function giveID(todo){
                return {
                    editID:"edit_"+todo._id,
                    deleteID:"delete_"+todo.id,
                    listID:"listItem_"+todo.id,
                    todoID:"todo_"+todo.id
                };
            }
            function buildItem(todo){
                return `<li class="list-group-item" id="list_${todo._id}">
                            <div class="row">
                                <div class="col-md-8">${todo.item}</div>                                
                                <div class="col-md-4 text-right">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="editTodo('${todo._id}')" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i> Edit</button>
                                    <button type="button" class="btn btn-danger btn-sm"  onclick="removeTodo('${todo._id}')"><i class="fa fa-trash"></i> Delete</button>
                                </div>
                            </div>                                                        
                        </li>`;
            }
            function buildtodos(todo_array){
                todo_array.forEach((todo)=>{                    
                    render.append(buildItem(todo));
                });
            }   
            
            function getTodos(){
                //render.html('');
                loading.css('display','inline');
                fetch('/getTodos',{method:'get'}).then((res)=>{
                    return res.json();
                }).then((data)=>{
                    loading.css('display','none');
                    buildtodos(data);
                });
            }         
            getTodos();

            form.submit((e)=>{
                e.preventDefault();
                fetch('/',{
                    method:'post',
                    body:JSON.stringify({"item":item_input.val()}),
                    headers : {
                        "Content-Type":"application/json"
                    }     

                }).then((res)=>{
                    return res.json();
                    
                }).then((data)=>{
                    if(data.result.n==1&data.result.ok==1){
                        var todo=data.document;
                        //buildItem(data,giveID(data));
                        render.append(buildItem(todo,giveID(todo)));
                        resetForm();
                    }
                    
                });
            });


            $('#form_edit').submit((e)=>{
                e.preventDefault();
                var x = $('#form_edit input').val().toString().trim();
                if(x!=''){
                    fetch('/'+$('#form_edit input').attr('id'),{
                        method:'put',
                        body:JSON.stringify({"item":x}),
                        headers : {
                            "Content-Type":"application/json"
                        }     

                    }).then((res)=>{
                        return res.json();
                        
                    }).then((data)=>{
                        if(data.ok==1){
                            var updated_value = data.value.item;
                            $("#list_"+data.value._id+" .row .col-md-8").html(updated_value);
                            $("#theBtn").click();
                        }
                        
                    });
                } 
                
            });
            
        });
        function removeTodo(id){
            fetch('/'+id,{method:'delete'}).then((res)=>{
                return res.json();
            }).then((data)=>{                    
                if(data.ok==1){
                    $('#list_'+id).remove();
                }
            });
        }
        
        function editTodo(id){
            
            $('#form_edit input').val($('#list_'+id+" .row .col-md-8").html().toString());
            $('#form_edit input').attr('id', id);
        };