
#include <cstdio>
#include <iostream>
#include <cstdlib>
#include <cmath>
#include "bmplib.h"

using namespace std;


void method1(unsigned char inImage[][SIZE][RGB], 
	     bool mask[][SIZE],
	     double threshold);

void method2(unsigned char inImage[][SIZE][RGB], 
	     bool mask[][SIZE]);

void replace(bool mask[][SIZE],
	     unsigned char inImage[][SIZE][RGB],
	     unsigned char bgImage[][SIZE][RGB],
	     unsigned char outImage[][SIZE][RGB]);

int main(int argc, char *argv[])
{
  
  static unsigned char inputImage[SIZE][SIZE][RGB];
  static unsigned char bgrndImage[SIZE][SIZE][RGB];
  static unsigned char outputImage[SIZE][SIZE][RGB];
  static bool chromaMask[SIZE][SIZE];

  double threshold;

  if (argc < 6) {
    cerr << "usage: program_name in.bmp background.bmp dist_threshold " 
         << "out1.bmp out2.bmp" << endl;
    return 0;
  }
	
  if (readRGBBMP(argv[1], inputImage)) {
    cerr << "Error reading file: " << argv[1] << endl;
    return 1;
  }

  if (readRGBBMP(argv[2], bgrndImage)) {
    cout << "Error reading file: " << argv[2] << endl;
    return 1;
  }
  
  // Write code to convert the threshold (argv[3])
  //  from string format to a double and assign the 'threshold'
  threshold = atof(argv[3]);


  // Call Method 1 Function
  method1(inputImage, chromaMask, threshold);

  // Produce the output by calling replace()
  replace(chromaMask, inputImage, bgrndImage, outputImage);

  // Write the output image to a file using the filename argv[4]
  if (writeRGBBMP(argv[4], outputImage)) {
    cout << "Error writing file: " << argv[4] << endl;
    exit(1);
  }	

  // Call Method 2 Function
  method2(inputImage, chromaMask);


  // Produce the output by calling replace()
  replace(chromaMask, inputImage, bgrndImage, outputImage);

  // Write the output image to a file using the filename argv[5]
  if (writeRGBBMP(argv[5], outputImage)) {
    cout << "Error writing file: " << argv[5] << endl;
    exit(1);
  }	
  return 0;
}



// Use user-provided threshold for chroma-key distance
// The "output" of this method is to produce a valid mask array
//  where entries in the mask array are 1 for foreground image
//  and 0 for 'background'
void method1(unsigned char inImage[][SIZE][RGB], 
	     bool mask[][SIZE],
	     double threshold)
{
  //total size of rows and columns colors
  int totalElements = SIZE*2;

  int redSum = 0;
  int blueSum = 0;
  int greenSum = 0;

  //red sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    redSum += inImage[0][i][0];
    redSum += inImage[i][0][0];
  }

  //green sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    greenSum += inImage[0][i][1];
    greenSum += inImage[i][0][1];
  }

  //blue sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    blueSum += inImage[0][i][2];
    blueSum += inImage[i][0][2];
  }
  //obtain Averages
  int redAvg = redSum / totalElements;
  int blueAvg = blueSum / totalElements;
  int greenAvg = greenSum / totalElements; 

  //iteration through entire image
  for(int r = 0; r <SIZE; r++)
  {
    for(int c = 0; c < SIZE; c++)
    {
      int red = inImage[r][c][0];
      int green = inImage[r][c][1];
      int blue = inImage[r][c][2];

      double distance = sqrt(pow(redAvg - red, 2.0) + pow(greenAvg - green, 2.0) + pow(blueAvg - blue, 2.0));
      if(distance < threshold)
      {
        mask[r][c] = 0;
      }
      else{
        mask[r][c] = 1;
      }
    }
  }

}

// Devise a method to automatically come up with a threshold
//  for the chroma key determination
// The "output" of this method is to produce a valid mask array
//  where entries in the mask array are 1 for foreground image
//  and 0 for 'background'
void method2(unsigned char inImage[][SIZE][RGB], 
	     bool mask[][SIZE])  
{
  //total size of rows and columns colors
  int totalElements = 0;

  int redSum = 0;
  int blueSum = 0;
  int greenSum = 0;

  //red sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    //we can assume the greenscreen will have a thickness of 5 pixels
    for(int j = 0; j < 5; j++)
    {
      redSum += inImage[j][i][0];
      redSum += inImage[i][j][0];
      totalElements += 2;
    }
  }

  //green sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    for(int j = 0; j < 5;j++)
    {
      greenSum += inImage[j][i][1];
      greenSum += inImage[i][j][1];
    }
  }

  //blue sum loop 
  for(int i = 0; i < SIZE; i++)
  {
    for(int j = 0; j < 5;j++)
    {
      blueSum += inImage[j][i][2];
      blueSum += inImage[i][j][2];
    }
  }
  //obtain chroma key Averages
  int redAvg = redSum / totalElements;
  int blueAvg = blueSum / totalElements;
  int greenAvg = greenSum / totalElements; 

  //highest possible distance
  double thresh = sqrt(pow(255.0, 2.0) + pow(255.0, 2.0) + pow(255.0, 2.0));

  //finding thresh
  //I want at least 200 pixels in each row of a small chunk of the image to be not background
  bool stop = true;
  while(stop == true)
  {
    int onePixels = 0;
    int opCount = 0;
    for(int i = 120; i < 140; i++)
    {
      for(int j = 15; j < SIZE - 15; j++)
      {
        int red = inImage[i][j][0];
        int green = inImage[i][j][1];
        int blue = inImage[i][j][2];

        double distance = sqrt(pow(redAvg - red, 2.0) + pow(greenAvg - green, 2.0) + pow(blueAvg - blue, 2.0));
        if(distance > thresh)
        {
          //counts how many of the pixels in the row are not background
          onePixels++;
        }
      }
      if(onePixels >= 200)
      {
        //counts how many of the rows had 200+ pixels not be in the background
        opCount++;
      }
    }
    //if 19/20 of the rows worked, then the threshold is acceptable
    if(opCount >= 19)
    {
      stop = false;
    }
    else{
      thresh -= 10;
    }
  }



  //we assumed that the pixels in row and column 0-5 would all be the greenscreen background
  for(int r = 0; r < 5; r++)
  {
    for(int c = 0; c < 5; c++)
    {
      mask[r][c] = 0;
    }
  }

  //setting the mask array
  for(int r = 5; r < SIZE; r++)
  {
    for(int c = 5; c < SIZE; c++)
    {
      int red = inImage[r][c][0];
      int green = inImage[r][c][1];
      int blue = inImage[r][c][2];

      double distance = sqrt(pow(redAvg - red, 2.0) + pow(greenAvg - green, 2.0) + pow(blueAvg - blue, 2.0));
      if(distance < thresh)
      {
        mask[r][c] = 0;
      }
      else{
        mask[r][c] = 1;
      }
    }
  }

}

// If mask[i][j] = 1 use the input image pixel for the output image
// Else if mask[i][j] = 0 use the background image pixel
void replace(bool mask[SIZE][SIZE],
	     unsigned char inImage[SIZE][SIZE][RGB],
	     unsigned char bgImage[SIZE][SIZE][RGB],
	     unsigned char outImage[SIZE][SIZE][RGB])
{
  // Create the output image using the mask to determine
  //  whether to use the pixel from the Input or Background image
  for(int r = 0; r < SIZE; r++)
  {
    for(int c = 0; c < SIZE; c++)
    {
      if(mask[r][c] == 0)
      {
        outImage[r][c][0] = bgImage[r][c][0];
        outImage[r][c][1] = bgImage[r][c][1];
        outImage[r][c][2] = bgImage[r][c][2];
      }
      else
      {
        outImage[r][c][0] = inImage[r][c][0];
        outImage[r][c][1] = inImage[r][c][1];
        outImage[r][c][2] = inImage[r][c][2];
      }
    }
  }

}
