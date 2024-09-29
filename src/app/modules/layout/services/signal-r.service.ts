import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  // private hubConnection!: HubConnection;

  // private messageSubject = new Subject<{ message: boolean; tenantId: number }>();

  // public messages$ = this.messageSubject.asObservable(); // Observable for components to subscribe

  // constructor() {
  //   this.startConnection();

  //  }
  //  private startConnection() {
  //   this.hubConnection = new HubConnectionBuilder()
  //     .withUrl('http://72.167.37.70:88/notify') // Replace with your hub URL
  //     .build();

  //   this.hubConnection
  //     .start()
  //     .then(() => console.log('SignalR connected'))
  //     .catch(err => console.error('Error while starting SignalR connection: ', err));

  //   this.hubConnection.on('SendNotification', (message: boolean, tenantId: number) => {
  //     console.log(`Received message: ${message}, TenantId: ${tenantId}`);
  //     this.messageSubject.next({ message, tenantId }); // Emit the received message

  //     // Handle the incoming message as needed
  //   });
  // }

  private hubConnection!: HubConnection;
  private messageSubject = new Subject<{ message: boolean; tenantId: number }>();
  public messages$ = this.messageSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  private startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://72.167.37.70:88/notify') // 101 port for production /88 for dev
      .withAutomaticReconnect() // Enable automatic reconnection
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('Error while starting SignalR connection: ', err));

    this.hubConnection.on('SendNotification', (message: boolean, tenantId: number) => {
      console.log(`Received message: ${message}, TenantId: ${tenantId}`);
      this.messageSubject.next({ message, tenantId });
    });

    // Handle reconnection events
    this.hubConnection.onreconnecting((error) => {
      console.warn('Reconnecting...', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log(`Reconnected with connection ID: ${connectionId}`);
    });

    this.hubConnection.onclose((error) => {
      console.error('Connection closed:', error);
      // Optionally, you can try to restart the connection here
      this.startConnection(); // Reconnect when closed
    });
  }
}
