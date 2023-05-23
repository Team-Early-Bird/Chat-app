
/*        let chatroomheadder = document.querySelector('#chatroom-headder');
        if (chatroomheadder) { 
            let chatroomName = document.querySelector('#chatroom-name');
            let ch_id = chatroomName.value;
            console.log('ch_id = ',ch_id);
        } else {
            let ch_id =　null;
            console.log('ch_id = None !!!');
        }*/
        //127.0.0.1:8080へwebsocket接続開通依頼
        let socket = io.connect('ws://127.0.0.1:8080',{
            //auth:{chid:${ch_id}}
            auth:{ token:"123" }
        });

        //WebSocket開通
        socket.on('connect', function() {
            console.log('User has connected!',socket.id);
            let chatroomName = document.querySelector('#chatroom-channel-id');
            if (chatroomName){
                let ch_id = chatroomName.value;
                console.log('ch_id = ', ch_id)
                socket.emit('join_room',ch_id);
            }
        });

        //message sendボタンの処理
        $('#add-message-btn').on('click', function(event) {
            event.preventDefault();
            let textMessage = { text: $('#message').val(), ch_id: $('#chatroom-channel-id').val() };
            socket.send(textMessage);
            $('#message').val('');
            console.log('served message');
        });


        //メッセージ削除ボタンの処理
        $(document).on('click', '.delete-message-btn', function(event) {
            event.preventDefault();
            let dellmessage = { channel_id: $('#delete-confirm-link').attr('data-value')};
            socket.emit('channel_dell',dellchannel);
            $('#delete-channel-modal').removeAttr("style").hide();
            console.log('Send Channel delete info!!! ',dellchannel);
        });
        
        //チャンネルリスト削除ボタンの処理
        $(document).on('click', '#delete-channel-confirmation-btn', function(event) {
            event.preventDefault();
            let dellchannel = { channel_id: $('#delete-confirm-link').attr('data-value')};
            socket.emit('channel_dell',dellchannel);
            $('#delete-channel-modal').removeAttr("style").hide();
            console.log('Send Channel delete info!!! ',dellchannel);
        });
/*
        //チャンネルリストを押したときの処理
        $(document).on('click','.channel-box-list',function() {
            let ch_id = $(this).attr('channel-id');
            console.log('channel-box-list',ch_id);
            //socket.emit('select_channel',ch_id);
        });
*/

        //チャンネルリスト追加 ADDボタンの処理
        $(document).on('click', '#add-channel-confirmation-btn', function() {
            event.preventDefault();
            let addchannel = { channel_name: $('#channel-title').val(), channel_abstract: $('#channel-description').val() };
            socket.emit('channel_add',addchannel);
            $('#channel-title').val('')
            $('#channel-description').val('')
            $('#add-channel-modal').removeAttr("style").hide();
            console.log('Send Channel add info!!! ');
        });

        //チャンネルリスト追加後の更新
        socket.on('channel_add_list',function(list) {
            
            channels = list.channels;
            uid = list.uid;
            pagination();
/*
            console.log('channel list1',list);
            let channelListContainer = document.getElementById('channel-list-container');
            channelListContainer.innerHTML = ''; // 一旦メッセージをクリア
            list.channels.forEach(function(element) {
                console.log('channel list2',element);
                let channelname = element.name;
                console.log('channel list3',channelname);

                let channelList = document.createElement('li');
                channelList.innerHTML = `
                    <button class="side-channel-list" channel-id="${element.id}">
                        # ${element.name}
                    </button>
                    <a href="/delete/${element.id}" id="side-channel-delete">
                        DELETE
                    </a>
                `;
                channelListContainer.appendChild(channelList);
            });*/
        });

        //チャンネル選択後の更新
/*        socket.on('update_channel', function(data) {
            let channel_id = data.ch.id;
            console.log('CHANNEL UPDATE!', channel_id);
            // チャンネルデータを取得
            let channelData = {
                name: data.ch.name ,
                abstract: data.ch.abstract
            };

            // チャットウィンドウ要素を取得
            let chatWindow = document.querySelector('#chat-box');

            // チャンネルデータを表示する
            let channelNameElement = chatWindow.querySelector('#chat-hedder');
            channelNameElement.innerText = "# " + channelData.name;
            consol.log('hoge');
            let channelAbstractElement = chatWindow.querySelector('#chatroom-description');
            if (channelAbstractElement) {
                channelAbstractElement.innerText = channelData.abstract;
            } else {
                let newChannelAbstractElement = document.createElement('div');
                newChannelAbstractElement.id = 'chatroom-description';
                newChannelAbstractElement.innerText = channelData.abstract;
                chatWindow.appendChild(newChannelAbstractElement);
            }

            //メッセージの表示

            let messageContainer = document.getElementById('chat-messages');
            messageContainer.innerHTML = ''; // 一旦メッセージをクリア
            data.messages.forEach(function(message) {
                let messageText = message.message;
                let newMessage = document.createElement('p');
                newMessage.textContent = messageText;
                messageContainer.appendChild(newMessage);
            });
            
            console.log('CHANNEL MESSAGE UPDATE!', channel_id);
        });
*/
/*
        $('#add-message-btn').on('click', function() {
            console.log('served message');
            let textMessage = { text: $('#message').val(), ch_id: $('#channel-id').val() };
            socket.send(textMessage);
            $('#message-box').val('');
            console.log('served message');
        });
*/
        // テキストエリアの更新
        socket.on('text_update', function(msg) {
            let uuid = '';
            let uuname = '';
            let mid = '';
            let string_txt = msg.text;
            let uid = msg.uid;
            let cid = msg.channel_id
            let latest_msg = msg.latest_msg;
            if (latest_msg && latest_msg.length > 0) {
                mid = latest_msg[0].id;
                uuid = latest_msg[0].uid;
                uuname = latest_msg[0].user_name;
                console.log('uuid:', uuid);
                console.log('mid:', mid);
                console.log('uuname:', uuname);
            }
            
            console.log('string_txt',string_txt);
            console.log('uid',uid);
            
            let chatroomName = document.querySelector('#chatroom-channel-id');
            let ch_id = chatroomName.value;
            let messageArea = document.getElementById('message-area');
            if(uid === uuid ) {
                let myMessage = document.createElement('div');
                    myMessage.classList.add("my-messages");
                let nameContainer = document.createElement('div');
                    nameContainer.classList.add("name-container");
                let myName = document.createElement('p');
                    myName.classList.add("my-name");
                    myName.textContent = uuname;
                    nameContainer.appendChild(myName);
                let messageContainer = document.createElement('div');
                    messageContainer.classList.add("message-container");
                let boxRight = document.createElement('p');
                    boxRight.classList.add("box");
                    boxRight.classList.add("box-right");
                    boxRight.textContent = string_txt;
                    messageContainer.appendChild(boxRight);
                let form = document.createElement('form');
                    form.action = '/delete_message';
                    form.method = 'POST';
                let input = document.createElement('input');
                    input.type = 'hidden';
                    input.value = cid;
                    input.name = 'channel_id';
                let button = document.createElement('button');
                    button.className = 'delete-message-btn';
                    button.name = 'message_id';
                    button.value = mid;
                let icon = document.createElement('ion-icon');
                    icon.name = 'trash-outline';

                    // 要素を組み合わせて階層構造を作成
                    button.appendChild(icon);
                    form.appendChild(input);
                    form.appendChild(button);

                    messageContainer.appendChild(form);
                    myMessage.appendChild(nameContainer);
                    myMessage.appendChild(messageContainer);
                    messageArea.appendChild(myMessage)
            }else{
                let Message = document.createElement('div');
                    Message.classList.add("messages");
                let userName = document.createElement('p');
                    userName.classList.add("user-name");
                    userName.textContent=uuname;
                    Message.appendChild(userName);
                let boxleft = document.createElement('p');
                    boxleft.textContent=string_txt;
                    boxleft.classList.add("box");
                    boxleft.classList.add("box-left");
                    Message.appendChild(boxleft);
                    messageArea.appendChild(Message)
                
            }
/*
            let newMessage = document.createElement('p');
            newMessage.textContent = string_txt;
            messageContainer.appendChild(newMessage);
*/
            console.log('TEXT UPDATE!', string_txt);
        });

