Project Description:
In this project, a green-screen/chroma key operation will be performed. An input image with a green background needs to be provided. 
The code will then identify the parts of that image that constitute the foreground (the mask) and those that represent the background (the key). 
Subsequently, the chroma key portion of the image will be replaced with the corresponding segments of a new background image. 
This technique finds frequent application in the TV, movie, and digital imaging industries.


Compilation instructions:
g++ -g -Wall -c bmplib.cpp -o bmplib.o  

g++ -g -Wall -o chromakey bmplib.o chromakey.cpp

./chromakey colbert_gs.bmp campus1.bmp 40.5 output1.bmp output2.bmp
