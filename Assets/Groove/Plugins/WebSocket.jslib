var LibraryWebSockets = {
$webSocketInstances: [],

SocketCreate: function(url, MsgRcvd, ConnectedCallback, DisconnectedCallback, ErrorCallback)
{
	var str = Pointer_stringify(url);
	var socket = {
		socket: new WebSocket(str),
		buffer: new Uint8Array(0),
		error: null,
		messages: []
	}

	socket.socket.binaryType = 'arraybuffer';

	socket.socket.onopen = function(e){
		Runtime.dynCall('v', ConnectedCallback, 0);
	}

	socket.socket.onmessage = function (e) {
		// Todo: handle other data types?
		if (e.data instanceof Blob)
		{
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				var array = new Uint8Array(reader.result);

				var dataBytes = array.length * array.BYTES_PER_ELEMENT;
				var dataPtr = Module._malloc(dataBytes);
				var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataBytes);
				dataHeap.set(array);

				var args = [dataPtr, dataBytes];
				Runtime.dynCall('vii', MsgRcvd, args);
			});
			reader.readAsArrayBuffer(e.data);
		}
		else if (e.data instanceof ArrayBuffer)
		{
			var array = new Uint8Array(e.data);
			
			var dataBytes = array.length * array.BYTES_PER_ELEMENT;
				var dataPtr = Module._malloc(dataBytes);
				var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataBytes);
				dataHeap.set(array);

				var args = [dataPtr, dataBytes];
				Runtime.dynCall('vii', MsgRcvd, args);
		}
		else if(typeof e.data === "string") {
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				var array = new Uint8Array(reader.result);

				var dataBytes = array.length * array.BYTES_PER_ELEMENT;
				var dataPtr = Module._malloc(dataBytes);
				var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataBytes);
				dataHeap.set(array);

				var args = [dataPtr, dataBytes];
				Runtime.dynCall('vii', MsgRcvd, args);
			});
			var blob = new Blob([e.data]);
			reader.readAsArrayBuffer(blob);
		}
	};

	socket.socket.onclose = function (e) {
		if (e.code != 1000)
		{
			if (e.reason != null && e.reason.length > 0)
				socket.error = e.reason;
			else
			{
				switch (e.code)
				{
					case 1001: 
						socket.error = "Endpoint going away.";
						break;
					case 1002: 
						socket.error = "Protocol error.";
						break;
					case 1003: 
						socket.error = "Unsupported message.";
						break;
					case 1005: 
						socket.error = "No status.";
						break;
					case 1006: 
						socket.error = "Abnormal disconnection.";
						break;
					case 1009: 
						socket.error = "Data frame too large.";
						break;
					default:
						socket.error = "Error "+e.code;
				}
			}
			Runtime.dynCall('v', ErrorCallback, 0);
		}
		else{
			Runtime.dynCall('v', DisconnectedCallback, 0);
		}
	}
	var instance = webSocketInstances.push(socket) - 1;
	return instance;
},

SocketState: function (socketInstance)
{
	var socket = webSocketInstances[socketInstance];
	return socket.socket.readyState;
},

SocketError: function (socketInstance, ptr, bufsize)
{
 	var socket = webSocketInstances[socketInstance];
 	if (socket.error == null)
 		return 0;
    var str = socket.error.slice(0, Math.max(0, bufsize - 1));
    writeStringToMemory(str, ptr, false);
	return 1;
},

SocketSend: function (socketInstance, ptr, length)
{
	var socket = webSocketInstances[socketInstance];
	socket.socket.send (HEAPU8.buffer.slice(ptr, ptr+length));
},

RaiseMirrorData : function(obj, array){
	var dataBytes = array.length * array.BYTES_PER_ELEMENT;
	var dataPtr = Module._malloc(dataBytes);
	var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataBytes);
	dataHeap.set(array);

	var args = [dataPtr, dataBytes];
	Runtime.dynCall('vii', obj, args);
},

SocketClose: function (socketInstance)
{
	var socket = webSocketInstances[socketInstance];
	socket.socket.close();
}
};

autoAddDeps(LibraryWebSockets, '$webSocketInstances');
mergeInto(LibraryManager.library, LibraryWebSockets);
