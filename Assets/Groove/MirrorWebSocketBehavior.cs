﻿#if !UNITY_WEBGL || UNITY_EDITOR
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace Mirror
{
	public class MirrorWebSocketBehavior : WebSocketBehavior
	{
		protected override void OnOpen()
		{
			base.OnOpen();
			Debug.Log("Opened by "+ID);
		}
		protected override void OnMessage(MessageEventArgs e)
		{
			Debug.Log("Got Message from: " + ID);
			GrooveTransport.AddMessage(new WebSocketMessage
			{
				ConnectionId = this.ID,
				Data = e.RawData
			});
		}
	}

	public class WebSocketMessage
	{
		public string ConnectionId;
		public byte[] Data;
	}
}
#endif