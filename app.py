from flask import Flask, request, redirect, render_template, session, flash
from models import dbConnect
from util.user import User
from datetime import timedelta
import hashlib
import uuid
import re

from flask_socketio import SocketIO, send, emit, join_room, leave_room


###################
# Initialization  #
###################
app = Flask(__name__)
app.secret_key = uuid.uuid4().hex
app.permanent_session_lifetime = timedelta(days=30)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')
user_count = 0

#########################
# Registration FUNCTION #
#########################
@app.route('/signup')
def signup():
    return render_template('registration/signup.html')


@app.route('/signup', methods=['POST'])
def userSignup():
    name = request.form.get('name')
    email = request.form.get('email')
    password1 = request.form.get('password1')
    password2 = request.form.get('password2')

    pattern = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

    if name == '' or email =='' or password1 == '' or password2 == '':
        flash('空のフォームがあるようです')
    elif password1 != password2:
        flash('二つのパスワードの値が違っています')
    elif re.match(pattern, email) is None:
        flash('正しいメールアドレスの形式ではありません')
    else:
        uid = uuid.uuid4()
        password = hashlib.sha256(password1.encode('utf-8')).hexdigest()
        user = User(uid, name, email, password)
        DBuser = dbConnect.getUser(email)

        if DBuser != None:
            flash('既に登録されているようです')
        else:
            dbConnect.createUser(user)
            UserId = str(uid)
            session['uid'] = UserId
            return redirect('/')
    return redirect('/signup')


@app.route('/login')
def login():
    return render_template('registration/login.html')


@app.route('/login', methods=['POST'])
def userLogin():
    #email = request.form.get('email')
    login_info = request.form.get('email')
    password = request.form.get('password')

    if login_info =='' or password == '':
        flash('空のフォームがあるようです')
    else:
        user = dbConnect.getUser(login_info)
        if user is None:
            flash('このユーザーは存在しません')
        else:
            hashPassword = hashlib.sha256(password.encode('utf-8')).hexdigest()
            if hashPassword != user["password"]:
                flash('パスワードが間違っています！')
            else:
                session['uid'] = user["uid"]
                return redirect('/')
    return redirect('/login')


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')


@app.route('/')
def index():
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    else:
        channels = dbConnect.getChannelAll()
    return render_template('index.html', channels=channels, uid=uid)

####################
# CHANNEL FUNCTION #
####################
'''
@app.route('/', methods=['POST'])
def add_channel():
    uid = session.get('uid')
    if uid is None:
        return redirect('/login')
    channel_name = request.form.get('channel-title')
    channel_description = request.form.get('channel-description')
    channel = dbConnect.getChannelByName(channel_name)
    if channel_name == '' or channel_description == '':
        error = '空欄があり登録できません'
        channels = dbConnect.getChannelAll()
        return render_template('index.html', channels=channels, error_message=error, uid=uid)
    elif channel is None:
        dbConnect.addChannel(uid, channel_name, channel_description)
        return redirect('/')    
    else:
        error = '既に同じチャンネルが存在しています'
        return render_template('error/error.html', error_message=error)

@app.route('/update_channel', methods=['POST'])
def update_channel():
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')

    cid = request.form.get('cid')
    channel_name = request.form.get('channel-title')
    channel_description = request.form.get('channel-description')

    dbConnect.updateChannel(uid, channel_name, channel_description, cid)
    channel = dbConnect.getChannelById(cid)
    messages = dbConnect.getMessageAll(cid)
    channels = dbConnect.getChannelAll()
    return render_template('detail.html', messages=messages, channel=channel, uid=uid, channels=channels)
'''

@app.route('/delete/<cid>')
def delete_channel(cid):
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    else:
        channel = dbConnect.getChannelById(cid)
        if channel["uid"] != uid:
            flash('チャンネルは作成者のみ削除可能です')
            return redirect ('/')
        else:
            dbConnect.deleteChannel(cid)
            channels = dbConnect.getChannelAll()
            return render_template('index.html', channels=channels, uid=uid)

# uidもmessageと一緒に返す
@app.route('/detail/<cid>')
def detail(cid):
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    cid = cid
    channel = dbConnect.getChannelById(cid)
    messages = dbConnect.getMessageAll(cid)
    channels = dbConnect.getChannelAll()
    return render_template('detail.html', messages=messages, channel=channel, uid=uid, channels=channels)


####################
# MESSAGE FUNCTION #
####################
'''
@app.route('/message', methods=['POST'])
def add_message():
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')

    message = request.form.get('message')
    channel_id = request.form.get('channel_id')

    if message:
        dbConnect.createMessage(uid, channel_id, message)

    channel = dbConnect.getChannelById(channel_id)
    messages = dbConnect.getMessageAll(channel_id)
    channels = dbConnect.getChannelAll()
    return render_template('detail.html', messages=messages, channel=channel, uid=uid, channels=channels)
'''

@app.route('/delete_message', methods=['POST'])
def delete_message():
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')

    message_id = request.form.get('message_id')
    cid = request.form.get('channel_id')
    if message_id:
        dbConnect.deleteMessage(message_id)

    channel = dbConnect.getChannelById(cid)
    messages = dbConnect.getMessageAll(cid)
    channels = dbConnect.getChannelAll()
    return render_template('detail.html', messages=messages, channel=channel, uid=uid, channels=channels)

#################
# ERROR HANDLER #
#################
@app.errorhandler(404)
def show_error404(error):
    return render_template('error/404.html')


@app.errorhandler(500)
def show_error500(error):
    return render_template('error/500.html')


######################
# WEBSOCKET FUNCTION #
######################

# ユーザーが新しく接続すると実行
@socketio.on('connect')
def connect(auth):
    global user_count 
    user_count += 1
    if session.get('sid') is not None:
        sid = session.get('sid')
    print('auth = ',str(auth))
    print('WebSocket Connecting!!!')
    print('user_count = ', user_count)

# ユーザーの接続が切断すると実行
@socketio.on('disconnect')
def disconnect():
    global user_count
    room = str(session.get('room'))
    print('room = ',room)
    leave_room(room)
    user_count -= 1
    print('WebSocket Disconnect!!!')
    print('user_count = ',user_count)

@socketio.on('join_room')
def join(ch_id):
    print('ch_id = ',ch_id)
    join_room(str(ch_id))
    print('join_room')
    session['room'] = ch_id



# メッセージを送る時の処理
@socketio.on('message')
def Text_MSG(msg):
    #channel_id = str(session.get('room'))
    print('msg = ',msg)
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    message = msg['text']
    channel_id = msg['ch_id']
    print('message = ', message)
    print('channel_id = ', channel_id)
    #join_room(str(channel_id))
    #print('join_room',ch_id)
    if message:
        dbConnect.createMessage(uid, channel_id, message)
    print('Create Message!!!')
    latest_msg = dbConnect.getMessageLatest(channel_id)
    print('latest_msg = ', latest_msg)
    emit('text_update', {'text': msg['text'],'uid':uid,'latest_msg':latest_msg,'channel_id':channel_id}, to=channel_id)

# チャンネル選択時の処理
@socketio.on('select_channel')
def update_ch(ch_id):
    print('ch_id from parameter = ',ch_id)
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    else:
        get_ch_id = session.get("room")
        print('ch_id from session.get = ',get_ch_id)
        print('request.sid = ',request.sid)
        sid = request.sid

        if get_ch_id is not None:
            leave_room(str(get_ch_id))
            print('leave_room',get_ch_id)
        join_room(str(ch_id))
        print('join_room',ch_id)
        session['room'] = ch_id
        '''
        channels = dbConnect.getChannelAll()
        channel = dbConnect.getChannelById(ch_id)
        messages = dbConnect.getMessageAll(ch_id)
        #print('channel = ',channel)
        #print('messages = ',messages)
        emit('update_channel',{'ch':channel,'messages':messages},to=sid)
        '''


# チャンネル選択時の処理
@socketio.on('channel_add')
def channel_add(addchannel):
    print('Broadcast channel list!!')
    print('channelname = ',addchannel)
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')

    channel_name = addchannel['channel_name']
    print('channel_name = ',channel_name)
    channel = dbConnect.getChannelByName(channel_name)

    if channel == None:
        channel_description = addchannel['channel_abstract']
        dbConnect.addChannel(uid, channel_name, channel_description)
        print('channel add success!!!')
        channels = dbConnect.getChannelAll()
        print('channels = ',channels)
        emit('channel_add_list', {'channels': channels}, broadcast=True)
    else:
        error = '既に同じチャンネルが存在しています'
        print(error)
        return app.render_template('error/error.html', error_message=error)

#@socketio.on('detail')
def soc_detail(cid):
    uid = session.get("uid")
    if uid is None:
        return redirect('/login')
    print('cid = ',cid)
    cid = cid
    channel = dbConnect.getChannelById(cid)
    messages = dbConnect.getMessageAll(cid)
    channels = dbConnect.getChannelAll()
    return app.render_template('detail.html', messages=messages, channel=channel, uid=uid, channels=channels)







if __name__ == '__main__':
    #app.run(debug=True,port='8080')
    socketio.run(app, debug=True,port=8080)
