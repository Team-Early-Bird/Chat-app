
/*        let chatroomheadder = document.querySelector('#chatroom-headder');
        if (chatroomheadder) { 
            let chatroomName = document.querySelector('#chatroom-name');
            let ch_id = chatroomName.value;
            console.log('ch_id = ',ch_id);
        } else {
            let ch_id =　null;
            console.log('ch_id = None !!!');
        }*/
            let chatroomName = document.querySelector('#chatroom-name');
            let ch_id = chatroomName.value;
            console.log('ch_id = ', ch_id)
        //127.0.0.1:8080へwebsocket接続開通依頼
        let socket = io.connect('ws://127.0.0.1:8080',{
            //auth:{chid:${ch_id}}
            auth:{ token:"123" }
        });

        //WebSocket開通
        socket.on('connect', function() {
            console.log('User has connected!',socket.id);
            let chatroomName = document.querySelector('#chatroom-name');
            let ch_id = chatroomName.value;
            console.log('ch_id = ', ch_id)
            //socket.emit('select_channel',ch_id);
        });

        //message sendボタンの処理
        $('.send-button').on('click', function() {
            let textMessage = { text: $('#message-box').val(), ch_id: $('#channel-id').val() };
            socket.send(textMessage);
            $('#message-box').val('');
            console.log('served message');
        });

        //チャンネルリストを押したときの処理
        $(document).on('click','.channel-box-list',function() {
            let ch_id = $(this).attr('channel-id');
            console.log('channel-box-list',ch_id);
            socket.emit('select_channel',ch_id);
        });

        //チャンネルリスト追加 ADDボタンの処理
        $(document).on('click', '#add-button', function() {
            let addchannel = { channel_name: $('#add-channel-name').val(), channel_abstract: $('#add-channel-abstract').val() };
            socket.emit('channel_add',addchannel);
            $('#add-channel-name').val('')
            $('#add-channel-abstract').val('')
            $('#chModal').hide();
            console.log('Send Channel add info!!! ');
        });



        //チャンネルリスト追加後の更新
        socket.on('channel_add_list',function(list) {
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
            });
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
        $('#add-message-btn').on('click', function() {
            console.log('served message');
            let textMessage = { text: $('#message').val(), ch_id: $('#channel-id').val() };
            socket.send(textMessage);
            $('#message-box').val('');
            console.log('served message');
        });

        // テキストエリアの更新
        socket.on('text_update', function(msg) {
            let string_txt = msg.text;
            let messageContainer = document.getElementById('chat-messages');
            let newMessage = document.createElement('p');
            newMessage.textContent = string_txt;
            messageContainer.appendChild(newMessage);

            console.log('TEXT UPDATE!', string_txt);
        });

