let db;
const request = indexedDB.open('UserDatabase', 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const objectStore = db.createObjectStore('users', {keyPath: 'username'});
  objectStore.createIndex('password', 'password', { unique: false});
  objectStore.createIndex('experience', 'experience', { unique:false });
  objectStore.createIndex('lessonCompleted', 'lessonCompleted', { unique:false });
  objectStore.createIndex('levelFollower', 'levelFollower', { unique:false });
  objectStore.createIndex('quizzes', 'quizzes', { unique:false });

  const friendsStore = db.createObjectStore('friends', { keyPath: ['username', 'friendUsername']})
  friendsStore.createIndex('username', 'username', { unique: false });
  friendsStore.createIndex('friendUsername', 'friendUsername', { unique:false });

  const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true});
  messageStore.createIndex('sender', 'sender', {unique:false});
  messageStore.createIndex('receiver', 'receiver', {unique:false});
  messageStore.createIndex('messageText', 'messageText', { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  if(window.location.pathname.endsWith('info.html')) {
    loadInformation();
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  if(window.location.pathname.endsWith('profile.html')) {
    if (!checkUserLoggedIn()) {
      return;
    }
    loadProfile();
  }

  if(window.location.pathname.endsWith('ranking.html')) {
    if (!checkUserLoggedIn()) {
      return;
    }
    showRanking();
  }

  if(window.location.pathname.endsWith('level.html')) {
    if (!checkUserLoggedIn()) {
      return;
    }
    levelChecker();
  }
  if(window.location.pathname.endsWith('message.html')) {
    if (!checkUserLoggedIn()) {
      return;
    }
    loadMessage();
  }

  const signInForm = document.getElementById('signInForm');
  if (signInForm){
    signInForm.addEventListener('submit', handleSignInForm);
  }
  
  const logInForm = document.getElementById('logInForm');
  if (logInForm){
    logInForm.addEventListener('submit', handleLogInform)
  }

  const sendMessageForm = document.getElementById('sendMessageForm');
  if (sendMessageForm){
    sendMessageForm.addEventListener('submit', handleMessageForm);
  }
};

request.onerror = function(event) {
  console.error('开不了IndexedDB', event.target.errorCode);
};

function toggleFlip() {
  const toggle = document.getElementById('toggleFlip');
  toggle.checked = !toggle.checked;
}

function handleSignInForm(event) {
  event.preventDefault();

  if (!db) {
    console.error('再来依次')
    return
  }
  const username = document.getElementById('s_username').value;
  const password = document.getElementById('s_password').value;

  const transaction = db.transaction(['users']);
  const objectStore = transaction.objectStore('users');
  const request = objectStore.get(username);

  request.onsuccess = function() {
    if (request.result) {
      alert('客户名已经被选了')
    } else {
      const transaction = db.transaction(['users'], 'readwrite');
      const objectStore = transaction.objectStore('users');

      const quizzes = {};
      for (let i = 0; i < 17; i++) {
        quizzes[`quiz_${i}`] = false;
      }

      const levelFollower = {};
      levelFollower['level_0'] = true;
      for (let i = 1; i < 17; i++) {
        levelFollower[`level_${i}`] = false;
      }

      const user = {
        username: username,
        password: password,
        experience: 0,
        lessonCompleted: 0,
        quizzes: quizzes,
        levelFollower: levelFollower
      };

      const addRequest = objectStore.add(user);

      addRequest.onsuccess = function() {
        console.log('成功了');
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
        toggleFlip();
      };

      addRequest.onerror = function () {
        alert('Error: ' + addRequest.error);
      };
    };
  }

  request.onerror = function() {
    alert('Error: ' + request.error)
  };
  
  document.getElementById('signInForm').reset();
};

function handleLogInform (event) {
  event.preventDefault();
  if (!db) {
    console.log("再来依次");
    return;
  }

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  const transaction = db.transaction(['users']);
  const objectStore = transaction.objectStore('users');
  const request = objectStore.get(username);

  request.onsuccess = function () {
    const user = request.result;
    if (user && user.password == password){
      localStorage.setItem('username', username);
      alert("成功")
      window.location.href = '../templates/menu.html'
    }
    else{
      alert("密码不对吧")
    }
  };

  request.onerror = function () {
    alert ('Error ' + request.error);
  };
  document.getElementById('logInForm').reset();
}

function loadInformation (){
  if (!db) {
    console.error('再来依次')
    return
  }

  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const gender = document.getElementById('gender');
  username.innerHTML = localStorage.getItem('username');
  password.innerHTML = localStorage.getItem('password');
  gender.innerHTML = localStorage.getItem('gender');
}

function loadProfile (){
  if (!db) {
    console.error('再来依次')
    return
  }

  const username = document.getElementById('username');
  const password = document.getElementById('password');
  
  const experience = document.getElementById('experience');
  const lessonCompleted = document.getElementById('lessonCompleted');

  const transaction = db.transaction(['users', 'friends']);
  const userStore = transaction.objectStore('users');
  const friendStore = transaction.objectStore('friends');

  const request = userStore.get(localStorage.getItem('username'));

  request.onsuccess = function () {
    const user = request.result;
    username.innerHTML = user.username;
    password.innerHTML = user.password;
    experience.innerHTML = user.experience;
    lessonCompleted.innerHTML = user.lessonCompleted;
    const friendsList = document.getElementById("friends");
    
    const friendIndex = friendStore.index('username');
    const friendRequest = friendIndex.getAll(user.username);

    friendRequest.onsuccess = function() {
      const friends = friendRequest.result;
      friendsList.innerHTML = '';

      if (friends.length > 0) {
        friends.forEach(friendRelation => {
          const friendItem = document.createElement('li');
          friendItem.textContent = friendRelation.friendUsername;
          friendsList.appendChild(friendItem);
        });

      }
      else{
        friendsList.textContent = '你没有朋友';
      }
    };
    friendRequest.onerror = function() {
      console.error('再来一次：' + friendRequest.error);
    }
  };

  request.onerror = function () {
    alert ('Error ' + request.error);
  };
}

function showRanking() {
  if (!db) {
    alert('再来一次');
    return;
  }

  const transaction = db.transaction(['users'], 'readonly');
  const objectStore = transaction.objectStore('users');
  const request = objectStore.getAll();

  request.onsuccess = function(event) {
    const users = event.target.result;

    users.sort((a, b) => {
      if (a.level === b.level) {
        return b.experience - a.experience;
      }
      return b.lessonCompleted - a.lessonCompleted;
    });

    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    users.forEach((user, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${index + 1}. username: ${user.username} level: ${user.lessonCompleted} experience: ${user.experience}`;

      if (user.username === localStorage.getItem('username')) {
        listItem.textContent += ' - 这是你';
  
      } else {
        const addButton = document.createElement('button');
        addButton.textContent = '加友';
        addButton.onclick = function() {
          addFriend(user.username);
        };
        listItem.appendChild(addButton);
      }

      userList.appendChild(listItem);
    });
  };

  function addFriend(friendUsername) {
    if (!db) {
      alert('再来');
      return;
    }

    const currentUsername = localStorage.getItem('username');

    if (friendUsername === currentUsername) {
      alert('不可以加自己');
      return;
    }

    const transaction = db.transaction(['friends'], 'readwrite');
    const friendsStore = transaction.objectStore('friends');

    const request = friendsStore.get([currentUsername, friendUsername]);

    request.onsuccess = function() {
      if (request.result) {
        alert('你们已经是朋友了');
      } else {
        const addRequest = friendsStore.add({ username: currentUsername, friendUsername: friendUsername });
        addRequest.onsuccess = function() {
          alert(`成功加了 ${friendUsername}`);
        };
        addRequest.onerror = function() {
          alert(`Error: ${addRequest.error}`);
        };
      }
    };

    request.onerror = function() {
      alert(`Error: ${request.error}`);
    };
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = '../index.html';
}

function handleMessageForm(event) {
  event.preventDefault();

  if (!db) {
    console.error('Database not initialized');
    return;
  }

  // Check if the user has friends
  const friendList = document.getElementById('friendList');
  if (friendList.options.length === 0 || friendList.value === '') {
    alert('你没有朋友，不能发信息');
    return;
  }

  const messageText = document.getElementById('message').value;
  const sender = localStorage.getItem('username');
  const receiver = friendList.value;

  if (!messageText || !receiver) {
    alert('信息或接收者不能为空');
    return;
  }

  const transaction = db.transaction(['messages'], 'readwrite');
  const objectStore = transaction.objectStore('messages');

  const request = objectStore.add({
    sender: sender,
    receiver: receiver,
    messageText: messageText
  });

  request.onsuccess = function() {
    alert('信息发送成功');
    loadMessage();
  };

  request.onerror = function() {
    alert('发送错误: ' + request.error);
  };

  document.getElementById('sendMessageForm').reset();
}

function loadMessage() {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  const transaction = db.transaction(['messages', 'friends']);
  const messageStore = transaction.objectStore('messages');
  const friendStore = transaction.objectStore('friends');

  const receiverIndex = messageStore.index('receiver');
  const request = receiverIndex.getAll(localStorage.getItem('username'));

  const messageList = document.getElementById('messageList');
  messageList.innerHTML = '';

  request.onsuccess = function() {
    if (request.result.length > 0) {
      request.result.forEach(message => {
        const messageItem = document.createElement('li');
        messageItem.textContent = `发：${message.sender} - 说：${message.messageText}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删';
        deleteButton.onclick = function() {
          deleteMessage(message.id);
        };
        messageItem.appendChild(deleteButton);
        messageList.appendChild(messageItem);
      });
    } else {
      messageList.textContent = '没人发信息给你';
    }
  };

  request.onerror = function() {
    alert('加载信息错误');
  };

  // Complete loading friends for messaging
  const friendListSelect = document.getElementById('friendList');
  friendListSelect.innerHTML = ''; // Clear previous options

  const friendIndex = friendStore.index('username');
  const friendRequest = friendIndex.getAll(localStorage.getItem('username'));

  friendRequest.onsuccess = function() {
    if (friendRequest.result.length > 0) {
      friendRequest.result.forEach(friendRelation => {
        const option = document.createElement('option');
        option.value = friendRelation.friendUsername;
        option.textContent = friendRelation.friendUsername;
        friendListSelect.appendChild(option);
    });
    } else {
      const noFriendsOption = document.createElement('option');
      noFriendsOption.textContent = '你没有朋友';
      noFriendsOption.disabled = true;
      friendListSelect.appendChild(noFriendsOption);
    }
  };

  friendRequest.onerror = function() {
    console.error('加载朋友列表错误: ' + friendRequest.error);
  };
}

function deleteMessage(messageId) {
  const transaction = db.transaction(['messages'], 'readwrite');
  const objectStore = transaction.objectStore('messages');
  const request = objectStore.delete(messageId);

  request.onsuccess = function() {
    alert('信息删除成功');
    loadMessage(); 
  };

  request.onerror = function() {
    alert('删除错误: ' + request.error);
  }
}

function checkUserLoggedIn() {
  if (!localStorage.getItem('username')) {
    alert('请登录');
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

function levelChecker() {
  if (!db) {
    alert('再来');
    return;
  }

  const transaction = db.transaction(['users'], 'readonly');
  const objectStore = transaction.objectStore('users');
  const request = objectStore.get(localStorage.getItem('username'));

  request.onsuccess = function(event) {
    const user = event.target.result;
    const level = user.lessonCompleted;

    const levelCompletionList = Object.keys(user.levelFollower).filter(level => user.levelFollower[level]);

    console.log(levelCompletionList);
  };

  request.onerror = function() {
    alert('Error: ' + request.error);
  };
}
