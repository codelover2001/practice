1)What is the main purpose of an operating system? Discuss different types? 
The purpose of operating systems is to manage computer memory, processes and the operation of all hardware and software. An operating system is the most important software on a computer as it enables the computer hardware to communicate effectively with all other computer software.
->Program Execution
->Handling Input/Output Operations
->Manipulation of File System
->Resource Allocation
->Error Detection and Handling

types:
->Batch Operating System
->Distributed Operating System
->Network Operating System 
->Real-Time Operating System


2)Difference between process and program and thread? Different types of process. 
Program
A program is a set of instructions and associated data that resides on the disk and is loaded by the operating system to perform some task. An executable file or a python script file are examples of programs. In order to run a program, the operating system's kernel is first asked to create a new process, which is an environment in which a program executes.

Process
A process is a program in execution. A process is an execution environment that consists of instructions, user-data, and system-data segments, as well as lots of other resources such as CPU, memory, address-space, disk and network I/O acquired at runtime. A program can have several copies of it running at the same time but a process necessarily belongs to only one program.

Thread
Thread is the smallest unit of execution in a process. A thread simply executes instructions serially. A process can have multiple threads running as part of it. Usually, there would be some state associated with the process that is shared among all the threads and in turn each thread would have some state private to itself. The globally shared state amongst the threads of a process is visible and accessible to all the threads, and special attention needs to be paid when any thread tries to read or write to this global shared state. There are several constructs offered by various programming languages to guard and discipline the access to this global state, which we will go into further detail in upcoming lessons.

S.NO	Process	Thread
1.	Process means any program is in execution.	Thread means segment of a process.
2.	Process takes more time to terminate.	Thread takes less time to terminate.
3.	It takes more time for creation.	It takes less time for creation.
4.	It also takes more time for context switching.	It takes less time for context switching.
5.	Process is less efficient in term of communication.	Thread is more efficient in term of communication.
6.	Process consume more resources.	Thread consume less resources.
7.	Process is isolated.	Threads share memory.
8.	Process is called heavy weight process.	Thread is called light weight process.
9.	Process switching uses interface in operating system.	Thread switching does not require to call a operating system and cause an interrupt to the kernel.
10.	If one process is blocked then it will not effect the execution of other process 	Second thread in the same task couldnot run, while one server thread is blocked.


3)What is RAID ? Different types.
Different RAID Levels
RAID 0 – striping. RAID 1 – mirroring. RAID 5 – striping with parity. RAID 6 – striping with double parity. RAID 10 – combining mirroring and striping.

4)What is a deadlock ? Different conditions to achieve a deadlock. 
Deadlock is a situation where-
The execution of two or more processes is blocked because each process holds some resource and waits for another resource held by some other process.

conditions:
Mutual Exclusion
Hold and Wait
No preemption
Circular wait

5)What is fragmentation? Types of fragmentation. 
Fragmentation
Fragmentation is an unwanted problem where the memory blocks cannot be allocated to the processes due to their small size and the blocks remain unused. It can also be understood as when the processes are loaded and removed from the memory they create free space or hole in the memory and these small blocks cannot be allocated to new upcoming processes and results in inefficient use of memory. Basically, there are two types of fragmentation:

Internal Fragmentation
External Fragmentation

Internal Fragmentation
In this fragmentation, the process is allocated a memory block of size more than the size of that process. Due to this some part of the memory is left unused and this cause internal fragmentation.
How to remove internal fragmentation?
This problem is occurring because we have fixed the sizes of the memory blocks. This problem can be removed if we use dynamic partitioning for allocating space to the process. In dynamic partitioning, the process is allocated only that much amount of space which is required by the process. So, there is no internal fragmentation.

External Fragmentation
In this fragmentation, although we have total space available that is needed by a process still we are not able to put that process in the memory because that space is not contiguous. This is called external fragmentation.
How to remove external fragmentation?
This problem is occurring because we are allocating memory continuously to the processes. So, if we remove this condition external fragmentation can be reduced. This is what done in paging & segmentation(non-contiguous memory allocation techniques) where memory is allocated non-contiguously to the processes. We will learn about paging and segmentation in the next blog.

Another way to remove external fragmentation is compaction. When dynamic partitioning is used for memory allocation then external fragmentation can be reduced by merging all the free memory together in one large block. This technique is also called defragmentation. This larger block of memory is then used for allocating space according to the needs of the new processes.

6)what is spooling?
Spooling
Spooling stands for "Simultaneous Peripheral Operations Online". So, in a Spooling, more than one I/O operations can be performed simultaneously i.e. at the time when the CPU is executing some process then more than one I/O operations can also de done at the same time. The following image will help us in understanding the concept in a better way:

7)What is semaphore and mutex
Mutex
Mutex or Mutual Exclusion Object is used to give access to a resource to only one process at a time. The mutex object allows all the processes to use the same resource but at a time, only one process is allowed to use the resource. Mutex uses the lock-based technique to handle the critical section problem.
Whenever a process requests for a resource from the system, then the system will create a mutex object with a unique name or ID. So, whenever the process wants to use that resource, then the process occupies a lock on the object. After locking, the process uses the resource and finally releases the mutex object. After that, other processes can create the mutex object in the same manner and use it.
By locking the object, that particular resource is allocated to that particular process and no other process can take that resource. So, in the critical section, no other processes are allowed to use the shared resource. In this way, the process synchronization can be achieved with the help of a mutex object.

Semaphore
Semaphore is an integer variable S, that is initialized with the number of resources present in the system and is used for process synchronization. It uses two functions to change the value of S i.e. wait() and signal(). Both these functions are used to modify the value of semaphore but the functions allow only one process to change the value at a particular time i.e. no two processes can change the value of semaphore simultaneously. There are two categories of semaphores i.e. Counting semaphores and Binary semaphores.

In Binary semaphores
the value of the semaphore variable will be 0 or 1. Initially, the value of semaphore variable is set to 1 and if some process wants to use some resource then the wait() function is called and the value of the semaphore is changed to 0 from 1. The process then uses the resource and when it releases the resource then the signal() function is called and the value of the semaphore variable is increased to 1. If at a particular instant of time, the value of the semaphore variable is 0 and some other process wants to use the same resource then it has to wait for the release of the resource by the previous process. In this way, process synchronization can be achieved. It is similar to mutex but here locking is not performed.

difference:
Mutex uses a locking mechanism i.e. if a process wants to use a resource then it locks the resource, uses it and then release it. But on the other hand, semaphore uses a signalling mechanism where wait() and signal() methods are used to show if a process is releasing a resource or taking a resource.
A mutex is an object but semaphore is an integer variable.
In semaphore, we have wait() and signal() functions. But in mutex, there is no such function.

8)Belady’s Anomaly?
Bélády’s anomaly is the name given to the phenomenon where increasing the number of page frames results in an increase in the number of page faults for a given memory access pattern.

9)Starving and Aging in OS
Starvation is a phenomenon in which a process that is present in the ready state and has low priority, keeps on waiting for the CPU allocation because some other process with higher priority comes with due respect to time.

Aging
To avoid starvation, we use the concept of Aging. In Aging, after some fixed amount of time quantum, we increase the priority of the low priority processes. By doing so, as time passes, the lower priority process becomes a higher priority process.

10)Why does trashing occur? 
Thrashing It is a state in which our CPU perform 'productive' work less and 'swapping' more. CPU is busy in swapping pages, so much that it can not respond to user program as much as required. Why it occurs In our system Thrashing occurs when there are too much pages in our memory, and each page referes t an other page. The real memory shortens in capacity to have all the pages in it, so it uses 'virtual memory'. When each page in execution demands that page that is not currently in real memory (RAM) it place some pages on virtual memory and adjust the required page on RAM. If CPU is so much busy in doing this task, thrashing occurs.

11)What is paging and why do we need it? 
Paging is a storage mechanism used to retrieve processes from the secondary storage into the main memory in the form of pages.

The main idea behind the paging is to divide each process in the form of pages. The main memory will also be divided in the form of frames.

One page of the process is to be stored in one of the frames of the memory. The pages can be stored at the different locations of the memory but the priority is always to find the contiguous frames or holes.

Pages of the process are brought into the main memory only when they are required otherwise they reside in the secondary storage.

Different operating system defines different frame sizes. The sizes of each frame must be equal. Considering the fact that the pages are mapped to the frames in Paging, page size needs to be as same as frame size.

12)Demand Paging, Segmentation 
Segmentation:
Segmentation is the arrangement of memory management. According to the segmentation the logical address space is a collection of segments. Each segment has a name and length. Each logical address have two quantities segment name and the segment offset, for simplicity we use the segment number in place of segment name.

Demand Paging:
Demand paging is identical to the paging system with swapping. In demand paging, a page is delivered into the memory on demand i.e., only when a reference is made to a location on that page. Demand paging combines the feature of simple paging and implement virtual memory as it has a large virtual memory. Lazy swapper concept is implemented in demand paging in which a page is not swapped into the memory unless it is required.

13)Real Time Operating System, types of RTOS. 
Real-time operating systems (RTOS) are used in environments where a large number of events, mostly external to the computer system, must be accepted and processed in a short time or within certain deadlines. such applications are industrial control, telephone switching equipment, flight control, and real-time simulations.  With an RTOS, the processing time is measured in tenths of seconds. This system is time-bound and has a fixed deadline. The processing in this type of system must occur within the specified constraints. Otherwise, This will lead to system failure.
->hard rtos
->soft rtos
->firm rtos

14)Difference between main memory and secondary memory. 
Primary memory is also called internal memory whereas Secondary memory is also known as a Backup memory or Auxiliary memory.
Primary memory can be accessed by the data bus whereas Secondary memory is accessed by I/O channels.
Primary memory data is directly accessed by the processing unit whereas Secondary memory data cannot be accessed directly by the processor.
Comparing primary and secondary storage devices, Primary storage devices are costlier than secondary storage device whereas Secondary storage devices are cheaper compared to primary storage device.
When we differentiate primary and secondary memory, Primary memory is both volatile & nonvolatile whereas Secondary memory is always a non-volatile memory.

15)Dynamic binding 
Dynamic binding or late binding is the mechanism a computer program waits until runtime to bind the name of a method called to an actual subroutine. It is an alternative to early binding or static binding where this process is performed at compile-time. Dynamic binding is more expensive computationally, but it has the advantage of being more likely to avoid version conflicts when binding functions of a linked library.

16)FCFS Scheduling 
Given n processes with their burst times, the task is to find average waiting time and average turn around time using FCFS scheduling algorithm. 
First in, first out (FIFO), also known as first come, first served (FCFS), is the simplest scheduling algorithm. FIFO simply queues processes in the order that they arrive in the ready queue. 
In this, the process that comes first will be executed first and next process starts only after the previous gets fully executed. 

17)SJF Scheduling 
Shortest job first (SJF) or shortest job next, is a scheduling policy that selects the waiting process with the smallest execution time to execute next. SJN is a non-preemptive algorithm. 
 
Shortest Job first has the advantage of having a minimum average waiting time among all scheduling algorithms.
It is a Greedy Algorithm.
It may cause starvation if shorter processes keep coming. This problem can be solved using the concept of ageing.

18)SRTF
Shortest Remaining Time First (SRTF) is the preemptive version of Shortest Job Next (SJN) algorithm, where the processor is allocated to the job closest to completion.

This algorithm requires advanced concept and knowledge of CPU time required to process the job in an interactive system, and hence can’t be implemented there. But, in a batch system where it is desirable to give preference to short jobs, SRT algorithm is used.

19)LRTF Scheduling 
This is a pre-emptive version of Longest Job First (LJF) scheduling algorithm. In this scheduling algorithm, we find the process with the maximum remaining time and then process it. We check for the maximum remaining time after some interval of time(say 1 unit each) to check if another process having more Burst Time arrived up to that time.

20)Priority Scheduling 
Priority scheduling is one of the most common scheduling algorithms in batch systems. Each process is assigned a priority. Process with the highest priority is to be executed first and so on. 
Processes with the same priority are executed on first come first served basis. Priority can be decided based on memory requirements, time requirements or any other resource requirement.

21)Round Robin is a CPU scheduling algorithm
Round Robin is a CPU scheduling algorithm where each process is assigned a fixed time slot in a cyclic way.

It is simple, easy to implement, and starvation-free as all processes get fair share of CPU.
One of the most commonly used technique in CPU scheduling as a core.
It is preemptive as processes are assigned CPU only for a fixed slice of time at most.
The disadvantage of it is more overhead of context switching.

22)Producer Consumer Problem 
The following are the problems that might occur in the Producer-Consumer:

The producer should produce data only when the buffer is not full. If the buffer is full, then the producer shouldn't be allowed to put any data into the buffer.
The consumer should consume data only when the buffer is not empty. If the buffer is empty, then the consumer shouldn't be allowed to take any data from the buffer.
The producer and consumer should not access the buffer at the same time.

23)Banker’s Algorithm 
The banker’s algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, then makes an “s-state” check to test for possible activities, before deciding whether allocation should be allowed to continue.

24)Explain Cache
Cache Memory is a special very high-speed memory. It is used to speed up and synchronizing with high-speed CPU. Cache memory is costlier than main memory or disk memory but economical than CPU registers. Cache memory is an extremely fast memory type that acts as a buffer between RAM and the CPU. It holds frequently requested data and instructions so that they are immediately available to the CPU when needed.

Cache memory is used to reduce the average time to access data from the Main memory. The cache is a smaller and faster memory which stores copies of the data from frequently used main memory locations. There are various different independent caches in a CPU, which store instructions and data.

25)Diff between direct mapping and associative mapping 
Direct Mapping –
The simplest technique, known as direct mapping, maps each block of main memory into only one possible cache line. or
In Direct mapping, assigne each memory block to a specific line in the cache. If a line is previously taken up by a memory block when a new block needs to be loaded, the old block is trashed. An address space is split into two parts index field and a tag field. The cache is used to store the tag field whereas the rest is stored in the main memory. Direct mapping`s performance is directly proportional to the Hit ratio.

Associative Mapping –
In this type of mapping, the associative memory is used to store content and addresses of the memory word. Any block can go into any line of the cache. This means that the word id bits are used to identify which word in the block is needed, but the tag becomes all of the remaining bits. This enables the placement of any word at any place in the cache memory. It is considered to be the fastest and the most flexible mapping form.

26)Diff between multitasking and multiprocessing 
1. Multi-tasking :
Multi-tasking is the logical extension of multiprogramming. In this systems, the CPU executes multiple jobs by switching among them typically using a small time quantum, and the switches occur so frequently that the users can interact with each program while it is running. Multitasking are further classified into two categories: Single User & Multiuser.

2. Multiprocessing :
Multiprocessing is a system that has two or more than one processors. In this, CPUs are added for increasing computing speed of the system. Because of Multiprocessing, there are many processes that are executed simultaneously. Multiprocessing are further classified into two categories: Symmetric Multiprocessing, Asymmetric Multiprocessing.

